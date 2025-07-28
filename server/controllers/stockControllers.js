const axios = require('axios');
require('dotenv').config();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes cache for real-time data
const cache = {};

// Debug logging
console.log('🔍 Environment Check:');
console.log('POLYGON_API_KEY exists:', !!POLYGON_API_KEY);
console.log('POLYGON_API_KEY length:', POLYGON_API_KEY ? POLYGON_API_KEY.length : 0);
console.log('POLYGON_API_KEY first 10 chars:', POLYGON_API_KEY ? POLYGON_API_KEY.substring(0, 10) + '...' : 'undefined');

// Rate limiting for Polygon API
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 1000; // 1 second between calls (Polygon allows 5 calls per minute)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getStockData = async (req, res) => {
  const symbol = req.query.symbol || 'AAPL';
  const now = Date.now();

  // Check cache first
  if (cache[symbol] && (now - cache[symbol].timestamp) < CACHE_DURATION_MS) {
    return res.json(cache[symbol].data);
  }

  // Rate limiting
  const timeSinceLastCall = now - lastCallTime;
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    await delay(MIN_CALL_INTERVAL - timeSinceLastCall);
  }

  try {
    if (!POLYGON_API_KEY) {
      console.log('❌ Polygon API key not found in environment');
      return res.status(500).json({ 
        error: 'Polygon API key not configured.',
        symbol: symbol 
      });
    }

    lastCallTime = Date.now();
    console.log(`🚀 Fetching real-time data for ${symbol} from Polygon...`);
    
    // Get real-time quote from Polygon - using the correct endpoint
    const quoteResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`, {
      params: {
        apikey: POLYGON_API_KEY,
        adjusted: true
      },
      timeout: 10000,
    });

    console.log(`📊 Polygon API Response for ${symbol}:`, JSON.stringify(quoteResponse.data, null, 2));

    const quoteData = quoteResponse.data.results;
    if (!quoteData || quoteData.length === 0) {
      return res.status(404).json({ 
        error: `No data found for symbol: ${symbol}`,
        symbol: symbol 
      });
    }

    const latestData = quoteData[0];
    const stockData = {
      symbol: symbol.toUpperCase(),
      price: latestData.c?.toFixed(2) || 'N/A',
      volume: latestData.v?.toLocaleString() || 'N/A',
      latestTradingDay: new Date(latestData.t).toISOString().split('T')[0],
      previousClose: latestData.c?.toFixed(2) || 'N/A',
      change: latestData.c && latestData.o ? 
        (latestData.c - latestData.o).toFixed(2) : 'N/A',
      changePercent: latestData.c && latestData.o ? 
        (((latestData.c - latestData.o) / latestData.o) * 100).toFixed(2) + '%' : 'N/A',
      high: latestData.h?.toFixed(2) || 'N/A',
      low: latestData.l?.toFixed(2) || 'N/A',
      open: latestData.o?.toFixed(2) || 'N/A',
      lastUpdated: new Date().toISOString(),
      dataSource: 'real-time'
    };

    cache[symbol] = { data: stockData, timestamp: now };
    console.log(`✅ Successfully cached real-time data for ${symbol}`);

    res.json(stockData);
  } catch (err) {
    console.error(`❌ Error fetching real-time data for ${symbol}:`, err.message);
    console.error('Full error:', err);
    
    if (err.response?.status === 429) {
      return res.status(429).json({ 
        error: 'API rate limit exceeded. Please try again in a minute.',
        retryAfter: 60 
      });
    }
    
    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timeout. Please try again.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch real-time stock data',
      details: err.message 
    });
  }
};

const getBatchStocks = async (req, res) => {
  const symbols = req.query.symbols?.split(',') || [];

  if (!symbols.length) {
    return res.status(400).json({ error: 'No symbols provided' });
  }

  if (symbols.length > 10) {
    return res.status(400).json({ 
      error: 'Too many symbols requested. Maximum 10 symbols allowed.' 
    });
  }

  try {
    const results = [];
    
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i].trim().toUpperCase();
      const now = Date.now();
      
      // Check cache first
      if (cache[symbol] && (now - cache[symbol].timestamp) < CACHE_DURATION_MS) {
        results.push(cache[symbol].data);
        continue;
      }

      // Rate limiting - stagger requests
      if (i > 0) {
        await delay(1000); // 1 second between calls
      }

      try {
        if (!POLYGON_API_KEY) {
          results.push({ 
            symbol: symbol, 
            error: 'API key not configured' 
          });
          continue;
        }

        console.log(`🚀 Fetching real-time data for ${symbol}...`);
        
        const quoteResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`, {
          params: {
            apikey: POLYGON_API_KEY,
            adjusted: true
          },
          timeout: 10000,
        });

        const quoteData = quoteResponse.data.results;
        if (!quoteData || quoteData.length === 0) {
          results.push({ 
            symbol: symbol, 
            error: 'Data not found' 
          });
          continue;
        }

        const latestData = quoteData[0];
        const stockData = {
          symbol: symbol,
          price: latestData.c?.toFixed(2) || 'N/A',
          volume: latestData.v?.toLocaleString() || 'N/A',
          latestTradingDay: new Date(latestData.t).toISOString().split('T')[0],
          previousClose: latestData.c?.toFixed(2) || 'N/A',
          change: latestData.c && latestData.o ? 
            (latestData.c - latestData.o).toFixed(2) : 'N/A',
          changePercent: latestData.c && latestData.o ? 
            (((latestData.c - latestData.o) / latestData.o) * 100).toFixed(2) + '%' : 'N/A',
          high: latestData.h?.toFixed(2) || 'N/A',
          low: latestData.l?.toFixed(2) || 'N/A',
          open: latestData.o?.toFixed(2) || 'N/A',
          lastUpdated: new Date().toISOString(),
          dataSource: 'real-time'
        };

        cache[symbol] = { data: stockData, timestamp: now };
        results.push(stockData);
        console.log(`✅ Successfully processed real-time data for ${symbol}`);
        
      } catch (error) {
        console.error(`❌ Error fetching real-time data for ${symbol}:`, error.message);
        results.push({ 
          symbol: symbol, 
          error: 'Failed to fetch real-time data' 
        });
      }
    }

    console.log(`✅ Batch request completed. Processed ${results.length} symbols with real-time data.`);
    res.json(results);
  } catch (err) {
    console.error('❌ Error in batch request:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch batch stock data',
      details: err.message 
    });
  }
};

// Get chart data for a specific stock
const getStockChart = async (req, res) => {
  const symbol = req.query.symbol || 'AAPL';
  const timeframe = req.query.timeframe || '1M'; // 1D, 1W, 1M, 3M, 1Y
  const now = Date.now();

  try {
    if (!POLYGON_API_KEY) {
      return res.status(500).json({ 
        error: 'Polygon API key not configured.',
        symbol: symbol 
      });
    }

    console.log(`📈 Fetching chart data for ${symbol} (${timeframe})...`);
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    const from = startDate.toISOString().split('T')[0];
    const to = endDate.toISOString().split('T')[0];

    // Get historical data from Polygon
    const chartResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`, {
      params: {
        apikey: POLYGON_API_KEY,
        adjusted: true,
        sort: 'asc',
        limit: 5000
      },
      timeout: 15000,
    });

    const chartData = chartResponse.data.results;
    if (!chartData || chartData.length === 0) {
      return res.status(404).json({ 
        error: `No chart data found for symbol: ${symbol}`,
        symbol: symbol 
      });
    }

    // Format chart data for frontend
    const formattedData = chartData.map(item => ({
      date: new Date(item.t).toISOString().split('T')[0],
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
      timestamp: item.t
    }));

    const chartInfo = {
      symbol: symbol.toUpperCase(),
      timeframe: timeframe,
      dataPoints: formattedData.length,
      startDate: from,
      endDate: to,
      data: formattedData
    };

    res.json(chartInfo);
  } catch (err) {
    console.error(`❌ Error fetching chart data for ${symbol}:`, err.message);
    
    if (err.response?.status === 429) {
      return res.status(429).json({ 
        error: 'API rate limit exceeded. Please try again in a minute.',
        retryAfter: 60 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch chart data',
      details: err.message 
    });
  }
};

// Get detailed stock information
const getStockDetails = async (req, res) => {
  const symbol = req.query.symbol || 'AAPL';

  try {
    if (!POLYGON_API_KEY) {
      return res.status(500).json({ 
        error: 'Polygon API key not configured.',
        symbol: symbol 
      });
    }

    console.log(`📊 Fetching detailed information for ${symbol}...`);
    
    // Get detailed stock information
    const detailsResponse = await axios.get(`https://api.polygon.io/v3/reference/tickers/${symbol}`, {
      params: {
        apikey: POLYGON_API_KEY,
      },
      timeout: 10000,
    });

    const detailsData = detailsResponse.data.results;
    if (!detailsData) {
      return res.status(404).json({ 
        error: `No detailed information found for symbol: ${symbol}`,
        symbol: symbol 
      });
    }

    const stockDetails = {
      symbol: symbol.toUpperCase(),
      name: detailsData.name || 'N/A',
      market: detailsData.market || 'N/A',
      locale: detailsData.locale || 'N/A',
      primaryExchange: detailsData.primary_exchange || 'N/A',
      type: detailsData.type || 'N/A',
      active: detailsData.active || false,
      currency: detailsData.currency_name || 'N/A',
      cik: detailsData.cik || 'N/A',
      compositeFigi: detailsData.composite_figi || 'N/A',
      shareClassFigi: detailsData.share_class_figi || 'N/A',
      lastUpdated: new Date().toISOString()
    };

    res.json(stockDetails);
  } catch (err) {
    console.error(`❌ Error fetching detailed information for ${symbol}:`, err.message);
    
    res.status(500).json({ 
      error: 'Failed to fetch detailed stock information',
      details: err.message 
    });
  }
};

// Get cache status
const getCacheStatus = async (req, res) => {
  const cacheKeys = Object.keys(cache);
  const cacheInfo = cacheKeys.map(key => ({
    symbol: key,
    timestamp: cache[key].timestamp,
    age: Date.now() - cache[key].timestamp,
    dataSource: cache[key].data.dataSource || 'unknown'
  }));

  res.json({
    totalCached: cacheKeys.length,
    cacheInfo: cacheInfo,
    apiKeyConfigured: !!POLYGON_API_KEY
  });
};

module.exports = { 
  getStockData, 
  getBatchStocks, 
  getStockChart, 
  getStockDetails, 
  getCacheStatus 
};
require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/stock-api.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/stocksearch',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Cache for stock data
const stockCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Polygon API configuration
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format percentage
const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Helper function to get color based on change
const getChangeColor = (change) => {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
};

// Get real-time stock data
const getStockData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    // Check if API key is configured
    if (!POLYGON_API_KEY) {
      return res.status(403).json({ 
        error: 'API key not configured',
        message: 'Please configure POLYGON_API_KEY in your .env file'
      });
    }

    // Check cache first
    const cached = stockCache.get(upperSymbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Fetch from Polygon API
    const response = await axios.get(`${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${upperSymbol}`, {
      params: {
        apikey: POLYGON_API_KEY
      }
    });

    if (!response.data.results) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const stockData = response.data.results;
    const formattedData = {
      symbol: upperSymbol,
      price: stockData.last?.p || 'N/A',
      change: stockData.last?.p ? (stockData.last.p - stockData.prevDay?.p).toFixed(2) : 'N/A',
      changePercent: stockData.last?.p && stockData.prevDay?.p 
        ? (((stockData.last.p - stockData.prevDay.p) / stockData.prevDay.p) * 100).toFixed(2)
        : 'N/A',
      volume: stockData.last?.v || 'N/A',
      high: stockData.last?.h || 'N/A',
      low: stockData.last?.l || 'N/A',
      open: stockData.last?.o || 'N/A',
      previousClose: stockData.prevDay?.c || 'N/A',
      marketCap: stockData.last?.market?.marketCap || 'N/A',
      timestamp: new Date().toISOString()
    };

    // Cache the data
    stockCache.set(upperSymbol, {
      data: formattedData,
      timestamp: Date.now()
    });

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`stock-${upperSymbol}`).emit('stock-update', formattedData);
    }

    logger.info(`Stock data fetched for ${upperSymbol}`);
    res.json(formattedData);

  } catch (error) {
    logger.error('Error fetching stock data:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'API key invalid or quota exceeded' });
    }

    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

// Get batch stock data
const getBatchStocks = async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({ error: 'Symbols parameter is required' });
    }

    // Check if API key is configured
    if (!POLYGON_API_KEY) {
      return res.status(403).json({ 
        error: 'API key not configured',
        message: 'Please configure POLYGON_API_KEY in your .env file'
      });
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase()).slice(0, 20);
    
    // Check cache for all symbols
    const cachedResults = [];
    const uncachedSymbols = [];
    
    symbolArray.forEach(symbol => {
      const cached = stockCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        cachedResults.push(cached.data);
      } else {
        uncachedSymbols.push(symbol);
      }
    });

    // Fetch uncached symbols from API
    const apiResults = [];
    if (uncachedSymbols.length > 0) {
      const promises = uncachedSymbols.map(async (symbol) => {
        try {
          const response = await axios.get(`${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`, {
            params: { apikey: POLYGON_API_KEY }
          });

          if (response.data.results) {
            const stockData = response.data.results;
            const formattedData = {
              symbol: symbol,
              price: stockData.last?.p || 'N/A',
              change: stockData.last?.p ? (stockData.last.p - stockData.prevDay?.p).toFixed(2) : 'N/A',
              changePercent: stockData.last?.p && stockData.prevDay?.p 
                ? (((stockData.last.p - stockData.prevDay.p) / stockData.prevDay.p) * 100).toFixed(2)
                : 'N/A',
              volume: stockData.last?.v || 'N/A',
              high: stockData.last?.h || 'N/A',
              low: stockData.last?.l || 'N/A',
              open: stockData.last?.o || 'N/A',
              previousClose: stockData.prevDay?.c || 'N/A',
              marketCap: stockData.last?.market?.marketCap || 'N/A',
              timestamp: new Date().toISOString()
            };

            // Cache the data
            stockCache.set(symbol, {
              data: formattedData,
              timestamp: Date.now()
            });

            return formattedData;
          }
        } catch (error) {
          logger.error(`Error fetching data for ${symbol}:`, error.message);
          return {
            symbol: symbol,
            price: 'N/A',
            change: 'N/A',
            changePercent: 'N/A',
            volume: 'N/A',
            high: 'N/A',
            low: 'N/A',
            open: 'N/A',
            previousClose: 'N/A',
            marketCap: 'N/A',
            error: 'Failed to fetch data'
          };
        }
      });

      const results = await Promise.all(promises);
      apiResults.push(...results);
    }

    const allResults = [...cachedResults, ...apiResults];

    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      allResults.forEach(stock => {
        io.to(`stock-${stock.symbol}`).emit('stock-update', stock);
      });
    }

    logger.info(`Batch stock data fetched for ${symbolArray.length} symbols`);
    res.json(allResults);

  } catch (error) {
    logger.error('Error fetching batch stock data:', error.message);
    res.status(500).json({ error: 'Failed to fetch batch stock data' });
  }
};

// Get stock chart data
const getStockChart = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1D', multiplier = 1 } = req.query;
    const upperSymbol = symbol.toUpperCase();

    const response = await axios.get(`${POLYGON_BASE_URL}/v2/aggs/ticker/${upperSymbol}/range/${multiplier}/${timeframe}`, {
      params: {
        apikey: POLYGON_API_KEY,
        limit: 100
      }
    });

    if (!response.data.results) {
      return res.status(404).json({ error: 'Chart data not found' });
    }

    const chartData = response.data.results.map(item => ({
      date: new Date(item.t).toISOString(),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }));

    // Calculate SMA
    const smaData = calculateSMA(chartData, 20);

    res.json({
      symbol: upperSymbol,
      timeframe: timeframe,
      data: chartData,
      sma: smaData
    });

  } catch (error) {
    logger.error('Error fetching chart data:', error.message);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};

// Calculate Simple Moving Average
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
    sma.push({
      date: data[i].date,
      value: sum / period
    });
  }
  return sma;
};

// Get stock details
const getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();

    const response = await axios.get(`${POLYGON_BASE_URL}/v3/reference/tickers/${upperSymbol}`, {
      params: {
        apikey: POLYGON_API_KEY
      }
    });

    if (!response.data.results) {
      return res.status(404).json({ error: 'Stock details not found' });
    }

    const details = response.data.results;
    const formattedDetails = {
      symbol: upperSymbol,
      name: details.name,
      description: details.description,
      homepage_url: details.homepage_url,
      market_cap: details.market_cap,
      phone_number: details.phone_number,
      share_class_shares_outstanding: details.share_class_shares_outstanding,
      total_employees: details.total_employees,
      weighted_shares_outstanding: details.weighted_shares_outstanding,
      sic_description: details.sic_description,
      sic_code: details.sic_code,
      ticker_root: details.ticker_root,
      ticker_suffix: details.ticker_suffix,
      primary_exchange: details.primary_exchange,
      currency_name: details.currency_name,
      cik: details.cik,
      composite_figi: details.composite_figi,
      share_class_figi: details.share_class_figi,
      market: details.market,
      locale: details.locale,
      active: details.active,
      last_updated_utc: details.last_updated_utc
    };

    res.json(formattedDetails);

  } catch (error) {
    logger.error('Error fetching stock details:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
};

// Get stock news
const getStockNews = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;
    const upperSymbol = symbol.toUpperCase();

    const response = await axios.get(`${POLYGON_BASE_URL}/v2/reference/news`, {
      params: {
        apikey: POLYGON_API_KEY,
        ticker: upperSymbol,
        limit: limit,
        order: 'desc'
      }
    });

    if (!response.data.results) {
      return res.json([]);
    }

    const news = response.data.results.map(item => ({
      id: item.id,
      publisher: item.publisher,
      title: item.title,
      author: item.author,
      published_utc: item.published_utc,
      article_url: item.article_url,
      tickers: item.tickers,
      image_url: item.image_url,
      description: item.description,
      keywords: item.keywords
    }));

    res.json(news);

  } catch (error) {
    logger.error('Error fetching stock news:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock news' });
  }
};

// Get market data
const getMarketData = async (req, res) => {
  try {
    // Mock market data for demonstration
    const marketData = {
      status: 'open',
      timestamp: new Date().toISOString(),
      indices: {
        'S&P 500': {
          symbol: '^GSPC',
          price: 4567.89,
          change: 12.34,
          changePercent: 0.27
        },
        'NASDAQ': {
          symbol: '^IXIC',
          price: 14234.56,
          change: -23.45,
          changePercent: -0.16
        },
        'DOW': {
          symbol: '^DJI',
          price: 34567.89,
          change: 45.67,
          changePercent: 0.13
        }
      },
      sectors: [
        { name: 'Technology', change: 0.8, color: '#3b82f6' },
        { name: 'Healthcare', change: -0.3, color: '#10b981' },
        { name: 'Finance', change: 0.5, color: '#f59e0b' },
        { name: 'Energy', change: -0.2, color: '#ef4444' },
        { name: 'Consumer', change: 0.1, color: '#8b5cf6' }
      ]
    };

    res.json(marketData);

  } catch (error) {
    logger.error('Error fetching market data:', error.message);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
};

// Get cache status
const getCacheStatus = async (req, res) => {
  try {
    const cacheInfo = Array.from(stockCache.entries()).map(([symbol, data]) => ({
      symbol,
      lastUpdated: new Date(data.timestamp).toISOString(),
      age: Date.now() - data.timestamp
    }));

    const memoryUsage = process.memoryUsage();
    
    res.json({
      totalCached: stockCache.size,
      cacheInfo: cacheInfo,
      apiKeyConfigured: !!POLYGON_API_KEY,
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      uptime: `${Math.round(process.uptime())} seconds`,
      rateLimit: {
        callsThisMinute: 0,
        maxCallsPerMinute: 30,
        lastCallTime: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting cache status:', error.message);
    res.status(500).json({ error: 'Failed to get cache status' });
  }
};

module.exports = {
  getStockData,
  getBatchStocks,
  getStockChart,
  getStockDetails,
  getStockNews,
  getMarketData,
  getCacheStatus
};
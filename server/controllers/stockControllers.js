const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const cache = {};

const getStockData = async (req, res) => {
  const symbol = req.query.symbol || 'AAPL';
  const now = Date.now();

  if (cache[symbol] && (now - cache[symbol].timestamp) < CACHE_DURATION_MS) {
    return res.json(cache[symbol].data);
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY,
      },
    });

    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    const stockData = {
      symbol: data['01. symbol'],
      price: data['05. price'],
      volume: data['06. volume'],
      latestTradingDay: data['07. latest trading day'],
      previousClose: data['08. previous close'],
      change: data['09. change'],
      changePercent: data['10. change percent'],
    };

    cache[symbol] = { data: stockData, timestamp: now };

    res.json(stockData);
  } catch (err) {
    console.error(`Error fetching data for ${symbol}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
};

const getBatchStocks = async (req, res) => {
  const symbols = req.query.symbols?.split(',') || [];

  if (!symbols.length) return res.status(400).json({ error: 'No symbols provided' });

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const reqCopy = { query: { symbol } };
      const resMock = { json: (data) => data };
      return getStockData(reqCopy, resMock).then(() => cache[symbol].data);
    })
  );

  res.json(results);
};

module.exports = { getStockData, getBatchStocks };
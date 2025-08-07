const express = require('express');
const router = express.Router();
const { 
  getStockData, 
  getBatchStocks, 
  getStockChart, 
  getStockDetails, 
  getStockNews,
  getMarketData,
  getCacheStatus 
} = require('../controllers/stockControllers');

// Real-time stock data endpoints
router.get('/:symbol', getStockData);                    // Single stock real-time data
router.get('/batch', getBatchStocks);                    // Multiple stocks real-time data
router.get('/:symbol/chart', getStockChart);             // Chart data for stock
router.get('/:symbol/details', getStockDetails);         // Detailed stock information
router.get('/:symbol/news', getStockNews);               // Stock news and articles
router.get('/market', getMarketData);                    // Market status and data
router.get('/cache', getCacheStatus);                    // Cache status

module.exports = router;

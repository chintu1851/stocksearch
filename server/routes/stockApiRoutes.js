const express = require('express');
const router = express.Router();
const { 
  getStockData, 
  getBatchStocks, 
  getStockChart, 
  getStockDetails, 
  getCacheStatus 
} = require('../controllers/stockControllers');

// Real-time stock data endpoints
router.get('/live', getStockData);          // Single stock real-time data
router.get('/batch', getBatchStocks);       // Multiple stocks real-time data
router.get('/chart', getStockChart);        // Chart data for stock
router.get('/details', getStockDetails);    // Detailed stock information
router.get('/cache', getCacheStatus);       // Cache status

module.exports = router;

const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticateUser } = require('../middleware/auth');

// All portfolio routes require authentication
router.use(authenticateUser);

// Portfolio management endpoints
router.get('/', portfolioController.getPortfolio);                           // Get user portfolio
router.post('/buy', portfolioController.buyStock);                          // Buy stock
router.post('/sell', portfolioController.sellStock);                        // Sell stock
router.get('/performance', portfolioController.getPortfolioPerformance);     // Get portfolio performance
router.get('/transactions', portfolioController.getTransactionHistory);      // Get transaction history

module.exports = router; 
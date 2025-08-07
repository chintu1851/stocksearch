const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

// Watchlist routes
router.get('/', watchlistController.getWatchlists);
router.get('/:id', watchlistController.getWatchlist);
router.post('/', watchlistController.createWatchlist);
router.put('/:id', watchlistController.updateWatchlist);
router.delete('/:id', watchlistController.deleteWatchlist);

// Stock management routes
router.post('/:id/stocks', watchlistController.addStockToWatchlist);
router.delete('/:id/stocks/:symbol', watchlistController.removeStockFromWatchlist);

module.exports = router; 
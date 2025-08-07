const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

// Settings routes
router.get('/settings', settingsController.getUserSettings);
router.put('/settings', settingsController.updateUserSettings);

// Dashboard routes
router.get('/dashboard', settingsController.getDashboardData);
router.get('/stats', settingsController.getUserStats);

module.exports = router; 
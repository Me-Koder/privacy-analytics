// server/src/routes/index.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const siteController = require('../controllers/siteController');
const auth = require('../middleware/auth');

// Public endpoints
router.post('/collect', analyticsController.collectEvent);

// Protected endpoints
router.use(auth);
router.get('/sites', siteController.getSites);
router.post('/sites', siteController.createSite);
router.get('/sites/:siteId/stats', siteController.getSiteStats);

module.exports = router;
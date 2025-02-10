// server/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.post('/collect', analyticsController.collectEvent);
router.get('/sites/:siteId/metrics', auth, analyticsController.getMetrics);
router.get('/sites/:siteId/visitors', auth, analyticsController.getVisitors);
router.get('/sites/:siteId/referrers', auth, analyticsController.getReferrers);
router.get('/sites/:siteId/pages', auth, analyticsController.getPages);

module.exports = router;
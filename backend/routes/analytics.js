const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/admin', authenticate, authorize('admin'), analyticsController.getAdminStats);
router.get('/ngo-performance', authenticate, authorize('admin'), analyticsController.getNgoPerformance);
router.get('/company', authenticate, authorize('company'), analyticsController.getCompanyStats);
router.get('/ngo-stats', authenticate, authorize('ngo'), analyticsController.getNgoStats);
router.get('/public', analyticsController.getPublicStats);
router.get('/map', analyticsController.getMapData);
router.get('/esg', analyticsController.getEsgMetrics);

module.exports = router;

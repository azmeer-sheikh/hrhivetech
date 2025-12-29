const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getAttendanceAnalytics,
  getLaborCostAnalytics,
  getPerformanceAnalytics,
  getLeaveAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/overview', getDashboardOverview);
router.get('/attendance', getAttendanceAnalytics);
router.get('/labor-cost', authorize('admin', 'hr'), getLaborCostAnalytics);
router.get('/performance', getPerformanceAnalytics);
router.get('/leaves', getLeaveAnalytics);

module.exports = router;

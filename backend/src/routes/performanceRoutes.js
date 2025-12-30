const express = require('express');
const router = express.Router();
const {
  getPerformanceReviews,
  getPerformanceReview,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  getEmployeePerformance,
  acknowledgeReview
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getPerformanceReviews);
router.get('/employee/:employeeId', getEmployeePerformance); // Must be BEFORE /:id
router.post('/', authorize('admin', 'hr', 'manager'), createPerformanceReview);

// These must come before generic /:id to avoid route conflicts
router.patch('/:id/acknowledge', acknowledgeReview);
router.get('/:id', getPerformanceReview);
router.put('/:id', authorize('admin', 'hr', 'manager'), updatePerformanceReview);
router.delete('/:id', authorize('admin', 'hr'), deletePerformanceReview);

module.exports = router;

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
router.get('/employee/:employeeId', getEmployeePerformance);
router.get('/:id', getPerformanceReview);

// Admin, HR, and Manager can create/update/delete reviews
router.post('/', authorize('admin', 'hr', 'manager'), createPerformanceReview);
router.put('/:id', authorize('admin', 'hr', 'manager'), updatePerformanceReview);
router.delete('/:id', authorize('admin', 'hr'), deletePerformanceReview);

// Employee can acknowledge review
router.patch('/:id/acknowledge', acknowledgeReview);

module.exports = router;

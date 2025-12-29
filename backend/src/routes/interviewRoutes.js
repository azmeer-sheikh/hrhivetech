const express = require('express');
const router = express.Router();
const {
  getInterviews,
  getInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  updateInterviewStatus,
  evaluateInterview,
  getInterviewStats
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getInterviews);
router.get('/stats/overview', authorize('admin', 'hr'), getInterviewStats);
router.get('/:id', getInterview);

// Admin and HR only
router.post('/', authorize('admin', 'hr'), createInterview);
router.put('/:id', authorize('admin', 'hr'), updateInterview);
router.delete('/:id', authorize('admin', 'hr'), deleteInterview);

// Interviewers can update status and evaluate
router.patch('/:id/status', authorize('admin', 'hr', 'manager'), updateInterviewStatus);
router.patch('/:id/evaluate', authorize('admin', 'hr', 'manager'), evaluateInterview);

module.exports = router;

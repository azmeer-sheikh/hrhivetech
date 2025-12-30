const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalance
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getLeaves);
router.get('/balance/:employeeId', getLeaveBalance);
router.post('/', createLeave);

// These must come before /:id to avoid route conflicts
router.put('/:id/approve', authorize('admin', 'hr', 'manager'), approveLeave);
router.put('/:id/reject', authorize('admin', 'hr', 'manager'), rejectLeave);

// Generic routes
router.get('/:id', getLeave);
router.put('/:id', updateLeave);
router.delete('/:id', deleteLeave);

module.exports = router;

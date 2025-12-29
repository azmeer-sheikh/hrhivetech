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
router.get('/:id', getLeave);
router.post('/', createLeave);
router.put('/:id', updateLeave);
router.delete('/:id', deleteLeave);

// Admin, HR, and Manager can approve/reject
router.patch('/:id/approve', authorize('admin', 'hr', 'manager'), approveLeave);
router.patch('/:id/reject', authorize('admin', 'hr', 'manager'), rejectLeave);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  processPayroll,
  getPayrollSummary
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getPayrolls);
router.get('/summary/stats', authorize('admin', 'hr'), getPayrollSummary);
router.get('/:id', getPayroll);

// Admin and HR only
router.post('/', authorize('admin', 'hr'), createPayroll);
router.put('/:id', authorize('admin', 'hr'), updatePayroll);
router.delete('/:id', authorize('admin', 'hr'), deletePayroll);
router.patch('/:id/process', authorize('admin', 'hr'), processPayroll);

module.exports = router;

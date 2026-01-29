const express = require('express');
const router = express.Router();
const {
  getPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  processPayroll,
  getPayrollSummary,
  exportPayrollExcel,
  getPayrollReceipt
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', authorize('admin', 'hr'), getPayrolls);
router.get('/summary/stats', authorize('admin', 'hr'), getPayrollSummary); // Must be BEFORE /:id
router.get('/export/excel', authorize('admin', 'hr'), exportPayrollExcel);
router.get('/:id/receipt', authorize('admin', 'hr'), getPayrollReceipt);
router.post('/', authorize('admin', 'hr'), createPayroll);

// These must come before generic /:id to avoid route conflicts
router.patch('/:id/process', authorize('admin', 'hr'), processPayroll);
router.get('/:id', authorize('admin', 'hr'), getPayroll);
router.put('/:id', authorize('admin', 'hr'), updatePayroll);
router.delete('/:id', authorize('admin', 'hr'), deletePayroll);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getEmployees);
router.get('/stats/overview', getEmployeeStats); // Must be BEFORE /:id
router.get('/:id', getEmployee);

// Admin and HR only
router.post('/', authorize('admin', 'hr'), createEmployee);
router.put('/:id', authorize('admin', 'hr'), updateEmployee);
router.delete('/:id', authorize('admin', 'hr'), deleteEmployee);

module.exports = router;

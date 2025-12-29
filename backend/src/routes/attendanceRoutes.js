const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceById,
  checkIn,
  checkOut,
  getEmployeeAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getAttendance);
router.get('/summary/stats', getAttendanceSummary);
router.get('/employee/:employeeId', getEmployeeAttendance);
router.get('/:id', getAttendanceById);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// Admin and HR only
router.put('/:id', authorize('admin', 'hr'), updateAttendance);
router.delete('/:id', authorize('admin', 'hr'), deleteAttendance);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceById,
  checkIn,
  checkOut,
  createAttendance,
  getEmployeeAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getAttendance);
router.post('/', createAttendance); // Create attendance record
router.get('/summary/stats', getAttendanceSummary); // Must be BEFORE /:id
router.get('/employee/:employeeId', getEmployeeAttendance); // Must be BEFORE /:id
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// Generic routes
router.get('/:id', getAttendanceById);
router.put('/:id', authorize('admin', 'hr'), updateAttendance);
router.delete('/:id', authorize('admin', 'hr'), deleteAttendance);

module.exports = router;

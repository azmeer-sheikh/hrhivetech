const express = require('express');
const router = express.Router();
const {
  getHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getUpcomingHolidays,
  getHolidayStats
} = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getHolidays);
router.get('/upcoming/list', getUpcomingHolidays);
router.get('/stats/overview', getHolidayStats);
router.get('/:id', getHoliday);

// Admin and HR only
router.post('/', authorize('admin', 'hr'), createHoliday);
router.put('/:id', authorize('admin', 'hr'), updateHoliday);
router.delete('/:id', authorize('admin', 'hr'), deleteHoliday);

module.exports = router;

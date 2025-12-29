const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
  markAsRead,
  getAnnouncementStats
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getAnnouncements);
router.get('/stats/overview', authorize('admin', 'hr'), getAnnouncementStats);
router.get('/:id', getAnnouncement);

// Admin and HR only
router.post('/', authorize('admin', 'hr'), createAnnouncement);
router.put('/:id', authorize('admin', 'hr'), updateAnnouncement);
router.delete('/:id', authorize('admin', 'hr'), deleteAnnouncement);
router.patch('/:id/pin', authorize('admin', 'hr'), togglePin);

// All authenticated users can mark as read
router.patch('/:id/read', markAsRead);

module.exports = router;

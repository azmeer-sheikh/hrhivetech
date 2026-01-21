const express = require('express');
const router = express.Router();
const { getQueueStatus, clearQueue } = require('../utils/emailJobQueue');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    Get email job queue status
 * @route   GET /api/queue/status
 * @access  Private (admin, hr)
 */
router.get('/status', protect, authorize('admin', 'hr'), (req, res) => {
  try {
    const status = getQueueStatus();
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @desc    Clear email job queue (for testing/maintenance)
 * @route   DELETE /api/queue/clear
 * @access  Private (admin only)
 */
router.delete('/clear', protect, authorize('admin'), (req, res) => {
  try {
    clearQueue();
    res.status(200).json({
      success: true,
      message: 'Queue cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

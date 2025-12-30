const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', getDocuments);
router.get('/stats/overview', authorize('admin', 'hr'), getDocumentStats); // Must be BEFORE /:id
router.post('/', uploadDocument);

// These must come before generic /:id to avoid route conflicts
router.get('/:id/download', downloadDocument);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;

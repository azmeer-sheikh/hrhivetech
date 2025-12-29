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
router.get('/stats/overview', authorize('admin', 'hr'), getDocumentStats);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);
router.post('/', uploadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;

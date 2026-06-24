const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', authenticate, authorize('ngo', 'admin'), upload.single('file'), documentController.uploadDocument);
router.get('/:projectId', authenticate, documentController.getDocuments);
router.delete('/:id', authenticate, authorize('ngo', 'admin'), documentController.deleteDocument);
router.get('/download/:id', authenticate, documentController.downloadDocument);

module.exports = router;

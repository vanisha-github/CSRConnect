const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticate, authorize('ngo'), upload.single('file'), updateController.addUpdate);
router.get('/:projectId', authenticate, updateController.getUpdates);
router.put('/:id', authenticate, authorize('ngo'), upload.single('file'), updateController.updateUpdate);
router.patch('/:id/visibility', authenticate, authorize('company'), updateController.toggleVisibility);
router.patch('/:id/review', authenticate, authorize('company'), updateController.reviewUpdate);
router.delete('/:id', authenticate, authorize('ngo'), updateController.deleteUpdate);

module.exports = router;

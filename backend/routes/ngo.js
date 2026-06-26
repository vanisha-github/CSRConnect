const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', authenticate, authorize('ngo'), ngoController.registerNgo);
router.get('/', authenticate, ngoController.getAllNgos);
router.get('/me', authenticate, authorize('ngo'), ngoController.getMyNgo);
router.post('/profile-image', authenticate, authorize('ngo'), upload.single('file'), ngoController.uploadProfileImage);
router.delete('/profile-image', authenticate, authorize('ngo'), ngoController.removeProfileImage);
router.get('/gallery', authenticate, authorize('ngo'), ngoController.getGallery);
router.post('/gallery', authenticate, authorize('ngo'), upload.single('file'), ngoController.uploadGalleryImage);
router.delete('/gallery/:id', authenticate, authorize('ngo'), ngoController.deleteGalleryImage);
router.get('/:id', authenticate, ngoController.getNgoById);
router.patch('/:id/verify', authenticate, authorize('admin'), ngoController.verifyNgo);
router.patch('/:id/reject', authenticate, authorize('admin'), ngoController.rejectNgo);
router.put('/:id', authenticate, authorize('admin', 'ngo'), ngoController.updateNgo);

module.exports = router;

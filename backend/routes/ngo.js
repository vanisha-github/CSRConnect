const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', authenticate, authorize('ngo'), ngoController.registerNgo);
router.get('/', authenticate, ngoController.getAllNgos);
router.get('/me', authenticate, authorize('ngo'), ngoController.getMyNgo);
router.get('/:id', authenticate, ngoController.getNgoById);
router.patch('/:id/verify', authenticate, authorize('admin'), ngoController.verifyNgo);
router.patch('/:id/reject', authenticate, authorize('admin'), ngoController.rejectNgo);
router.put('/:id', authenticate, authorize('admin', 'ngo'), ngoController.updateNgo);

module.exports = router;

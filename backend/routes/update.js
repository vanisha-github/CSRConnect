const express = require('express');
const router = express.Router();
const updateController = require('../controllers/updateController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('ngo'), updateController.addUpdate);
router.get('/:projectId', authenticate, updateController.getUpdates);
router.put('/:id', authenticate, authorize('ngo'), updateController.updateUpdate);

module.exports = router;

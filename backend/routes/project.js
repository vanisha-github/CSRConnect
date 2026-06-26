const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticate, authorize('company', 'admin'), projectController.createProject);
router.get('/', authenticate, projectController.getAllProjects);
router.get('/:id', authenticate, projectController.getProjectById);
router.put('/:id', authenticate, authorize('company', 'admin'), projectController.updateProject);
router.delete('/:id', authenticate, authorize('company', 'admin'), projectController.deleteProject);
router.patch('/:id/assign', authenticate, authorize('company', 'admin'), projectController.assignNgo);
router.post('/:id/cover-image', authenticate, authorize('ngo', 'company', 'admin'), upload.single('file'), projectController.uploadCoverImage);
router.delete('/:id/cover-image', authenticate, authorize('ngo', 'company', 'admin'), projectController.removeCoverImage);
router.patch('/:id/verify', authenticate, authorize('admin'), projectController.verifyProject);

module.exports = router;

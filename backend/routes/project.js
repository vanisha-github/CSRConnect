const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('company', 'admin'), projectController.createProject);
router.get('/', authenticate, projectController.getAllProjects);
router.get('/:id', authenticate, projectController.getProjectById);
router.put('/:id', authenticate, authorize('company', 'admin'), projectController.updateProject);
router.delete('/:id', authenticate, authorize('company', 'admin'), projectController.deleteProject);
router.patch('/:id/assign', authenticate, authorize('company', 'admin'), projectController.assignNgo);

module.exports = router;

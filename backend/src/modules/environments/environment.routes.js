const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams lets us read :projectId

const environmentController = require('./environment.controller');
const {
  validateCreateEnvironment,
  validateUpdateEnvironment,
} = require('./environment.validator');
const { protect } = require('../../middleware/auth.middleware');

// These are nested under /api/v1/projects/:projectId/environments
router.post('/', protect, validateCreateEnvironment, environmentController.createEnvironment);
router.get('/', protect, environmentController.listEnvironments);

// These match /api/v1/environments/:id directly (mount separately in app.js)
router.get('/:id', protect, environmentController.getEnvironment);
router.put('/:id', protect, validateUpdateEnvironment, environmentController.updateEnvironment);
router.delete('/:id', protect, environmentController.deleteEnvironment);

module.exports = router;
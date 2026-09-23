const express = require('express');
const { create, list, getOne, update, remove } = require('./project.controller');
const {
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
} = require('./project.validator');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/', validateCreateProject, create);
router.get('/', list);
router.get('/:projectId', validateProjectId, getOne);
router.patch('/:projectId', validateProjectId, validateUpdateProject, update);
router.delete('/:projectId', validateProjectId, remove);

module.exports = router;

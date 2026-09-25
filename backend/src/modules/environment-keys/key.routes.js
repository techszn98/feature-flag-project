const express = require('express');
const router = express.Router({ mergeParams: true });

const keyController = require('./key.controller');
const { validateCreateKey } = require('./key.validator');
const {protect} = require('../../middleware/auth.middleware');

// Mounted at /api/v1/environments/:id/keys
router.post('/', protect, validateCreateKey, keyController.createKey);
router.get('/',protect, keyController.listKeys);
router.delete('/:keyId', protect, keyController.revokeKey);

module.exports = router;
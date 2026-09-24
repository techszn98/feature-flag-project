const express = require('express');
const router = express.Router();
const evaluationController = require('./evaluation.controller');
const { evaluateValidator } = require('./evaluation.validator');

// 1. Main evaluation endpoint
router.post('/', evaluateValidator, evaluationController.evaluateFlags);


module.exports = router;
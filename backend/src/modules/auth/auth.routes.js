const express = require('express');
const { register, login, me } = require('./auth.controller');
const { validateRegister, validateLogin } = require('./auth.validator');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, me);

module.exports = router;
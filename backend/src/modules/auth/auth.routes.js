const express = require('express');
const {
  register,
  verifyEmail,
  resendOtp,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
  refresh,
  logout,
} = require('./auth.controller');
const {
  validateRegister,
  validateVerifyEmail,
  validateResendOtp,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
} = require('./auth.validator');
const { validateGoogleLogin } = require('../google-auth/google.validator');
const { protect } = require('../../middleware/auth.middleware');
const { authLimiter, otpLimiter } = require('../../middleware/rateLimit.middleware');
const googleRoutes = require('../google-auth/google.routes');

const router = express.Router();

// Registration & Verification
router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-email', otpLimiter, validateVerifyEmail, verifyEmail);
router.post('/resend-otp', otpLimiter, validateResendOtp, resendOtp);

// Authentication
router.post('/login', authLimiter, validateLogin, login);
router.post('/google', validateGoogleLogin, googleLogin);
router.use('/google', googleRoutes); // Preserve backward compatibility for /auth/google

// Password Recovery & Management
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, resetPassword);
router.post('/change-password', protect, validateChangePassword, changePassword);

// Session Lifecycle
router.get('/me', protect, me);
router.post('/refresh', validateRefreshToken, refresh);
router.post('/logout', logout);

module.exports = router;
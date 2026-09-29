const { AppError } = require('../../middleware/error.middleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

const checkEmail = (email, errors) => {
  if (typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Email is not valid');
  }
};

const checkPassword = (password, errors, fieldName = 'Password') => {
  if (typeof password !== 'string' || !password) {
    errors.push(`${fieldName} is required`);
  } else if (password.length < 8) {
    errors.push(`${fieldName} must be at least 8 characters`);
  } else if (password.length > 72) {
    errors.push(`${fieldName} must be at most 72 characters`);
  }
};

const checkOtp = (otp, errors) => {
  if (!otp || typeof otp !== 'string') {
    errors.push('OTP is required and must be a string');
  } else if (!OTP_REGEX.test(otp.trim())) {
    errors.push('OTP must be a 6-digit code');
  }
};

const validateRegister = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  checkEmail(email, errors);
  checkPassword(password, errors, 'Password');

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  checkEmail(email, errors);
  if (typeof password !== 'string' || !password) {
    errors.push('Password is required');
  }

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateVerifyEmail = (req, res, next) => {
  const { email, otp } = req.body || {};
  const errors = [];

  checkEmail(email, errors);
  checkOtp(otp, errors);

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateResendOtp = (req, res, next) => {
  const { email } = req.body || {};
  const errors = [];

  checkEmail(email, errors);

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body || {};
  const errors = [];

  checkEmail(email, errors);

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateResetPassword = (req, res, next) => {
  const { email, otp, newPassword } = req.body || {};
  const errors = [];

  checkEmail(email, errors);
  checkOtp(otp, errors);
  checkPassword(newPassword, errors, 'New password');

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body || {};
  const errors = [];

  if (typeof currentPassword !== 'string' || !currentPassword) {
    errors.push('Current password is required');
  }
  checkPassword(newPassword, errors, 'New password');

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || typeof refreshToken !== 'string') {
    return next(new AppError('Refresh token is required', 400));
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendOtp,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
};
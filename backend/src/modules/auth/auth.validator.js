const { AppError } = require('../../middleware/error.middleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const checkEmail = (email, errors) => {
  if (typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Email is not valid');
  }
};

const validateRegister = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  checkEmail(email, errors);

  if (typeof password !== 'string' || !password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (password.length > 72) {
    errors.push('Password must be at most 72 characters');
  }

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  checkEmail(email, errors);
  if (typeof password !== 'string' || !password) errors.push('Password is required');

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

module.exports = { validateRegister, validateLogin };
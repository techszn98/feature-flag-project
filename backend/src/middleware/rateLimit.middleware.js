const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';
const noopMiddleware = (req, res, next) => next();

/**
 * Global API rate limiter: 100 requests per 15 minutes
 */
const apiLimiter = isTest
  ? noopMiddleware
  : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    data: null,
  },
});

/**
 * Strict authentication limiter for login, register, password reset: 20 requests per 15 minutes
 */
const authLimiter = isTest
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        data: null,
      },
    });

/**
 * Strictest limiter for OTP generation & resend to prevent email flooding: 5 requests per 15 minutes
 */
const otpLimiter = isTest
  ? noopMiddleware
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many OTP requests. Please wait a few minutes before trying again.',
        data: null,
      },
    });

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
};

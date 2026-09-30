const rateLimit = require("express-rate-limit");
const { createRateLimitStore } = require("../config/redis");

const isTest = process.env.NODE_ENV === "test";
const noopMiddleware = (req, res, next) => next();

const configuredLimiter = (name, options) =>
  isTest
    ? noopMiddleware
    : rateLimit({
        ...options,
        standardHeaders: true,
        legacyHeaders: false,
        store: createRateLimitStore(name),
      });

/**
 * Global API rate limiter: 100 requests per 15 minutes
 */
const apiLimiter = configuredLimiter("api", {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
    data: null,
  },
});

/**
 * Strict authentication limiter for login, register, password reset: 20 requests per 15 minutes
 */
const authLimiter = configuredLimiter("auth", {
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
    data: null,
  },
});

const appAuthLimiter = configuredLimiter("auth-path", {
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts", data: null },
});

/**
 * Strictest limiter for OTP generation & resend to prevent email flooding: 5 requests per 15 minutes
 */
const otpLimiter = configuredLimiter("otp", {
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message:
      "Too many OTP requests. Please wait a few minutes before trying again.",
    data: null,
  },
});

module.exports = {
  apiLimiter,
  appAuthLimiter,
  authLimiter,
  otpLimiter,
};

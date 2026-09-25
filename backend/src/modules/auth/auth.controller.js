const authService = require('./auth.service');
const googleService = require('../google-auth/google.service');
const { sendSuccess } = require('../../utils/response');
const { MESSAGES } = require('./auth.constants');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, 201, MESSAGES.REGISTRATION_SUCCESS, {
      userId: result.userId,
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body);
    sendSuccess(res, 200, MESSAGES.VERIFICATION_SUCCESS, result);
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const result = await authService.resendVerificationOtp(req.body);
    sendSuccess(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.loginUser(req.body);
    sendSuccess(res, 200, 'Login successful', data);
  } catch (err) {
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const result = await googleService.authenticateGoogleUser(req.body);
    sendSuccess(res, 200, 'Google login successful', result);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    sendSuccess(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    sendSuccess(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user._id, req.body);
    sendSuccess(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    sendSuccess(res, 200, 'Current user fetched', { user });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    const tokens = await authService.refreshToken(refreshToken);
    sendSuccess(res, 200, MESSAGES.REFRESH_SUCCESS, tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    const result = await authService.logoutUser(refreshToken);
    sendSuccess(res, 200, result.message);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
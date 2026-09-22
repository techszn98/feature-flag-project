const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const userId = await authService.registerUser(req.body);
    sendSuccess(res, 201, 'User registered successfully', { userId });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    sendSuccess(res, 200, 'Login successful', { token, user });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    sendSuccess(res, 200, 'Current user fetched', { user: authService.toPublicUser(req.user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
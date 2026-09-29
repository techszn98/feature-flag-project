const User = require('../modules/auth/user.model');
const { verifyAccessToken } = require('../utils/token');
const { AppError } = require('./error.middleware');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token has expired. Please refresh your token or log in again.', 401);
      }
      throw new AppError('Invalid or malformed token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User belonging to this token no longer exists', 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
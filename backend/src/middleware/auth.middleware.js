const User = require('../modules/auth/user.model');
const { verifyToken } = require('../utils/jwt');
const { AppError } = require('./error.middleware');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User belonging to this token no longer exists', 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
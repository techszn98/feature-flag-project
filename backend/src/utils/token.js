const jwt = require('jsonwebtoken');
const {
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn,
  jwtRefreshExpiresIn,
} = require('../config/env');

const crypto = require('crypto');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'Client',
    },
    jwtAccessSecret,
    { expiresIn: jwtAccessExpiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      type: 'refresh',
      jti: crypto.randomBytes(16).toString('hex'),
    },
    jwtRefreshSecret,
    { expiresIn: jwtRefreshExpiresIn }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtAccessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtRefreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  // Alias for backward compatibility
  generateToken: generateAccessToken,
  verifyToken: verifyAccessToken,
};

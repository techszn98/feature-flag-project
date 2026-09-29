require('dotenv').config();

const required = ['MONGO_URI', 'JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key] && !process.env.MONGODB_URI) {
    throw new Error(`${key} is not set in your .env file`);
  }
});

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME || 'Feature Flag API',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
  },
  otp: {
    length: Number(process.env.OTP_LENGTH || 6),
    expiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
    resetExpiresMinutes: Number(process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES || 10),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  },
  app: {
    name: process.env.APP_NAME || 'Feature Flag API',
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
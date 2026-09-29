require("dotenv").config();
const fs = require("node:fs");

const readEnv = (name) => {
  const secretFile = process.env[`${name}_FILE`];
  if (secretFile) {
    try {
      return fs.readFileSync(secretFile, "utf8").trim();
    } catch {
      throw new Error(`${name}_FILE points to an unreadable secret file`);
    }
  }
  return process.env[name];
};

const mongoUri = readEnv("MONGO_URI") || readEnv("MONGODB_URI");
const jwtSecret = readEnv("JWT_SECRET");

if (!mongoUri) {
  throw new Error("MONGO_URI or MONGODB_URI is not set in your .env file");
}
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set in your .env file");
}

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri,
  jwtSecret,
  jwtAccessSecret: readEnv("JWT_ACCESS_SECRET") || jwtSecret,
  jwtRefreshSecret: readEnv("JWT_REFRESH_SECRET") || `${jwtSecret}_refresh`,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    password: readEnv("EMAIL_PASSWORD"),
    fromName: process.env.EMAIL_FROM_NAME || "Feature Flag API",
    fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
  },
  otp: {
    length: Number(process.env.OTP_LENGTH || 6),
    expiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
    resetExpiresMinutes: Number(
      process.env.PASSWORD_RESET_OTP_EXPIRES_MINUTES || 10,
    ),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  },
  app: {
    name: process.env.APP_NAME || "Feature Flag API",
    baseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  },
  readEnv,
};

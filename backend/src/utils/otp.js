const crypto = require('crypto');
const { otp: otpConfig } = require('../config/env');

/**
 * Generate a cryptographically secure numeric OTP of configured length (default 6 digits)
 */
function generateOtp(length = otpConfig.length || 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return crypto.randomInt(min, max).toString();
}

/**
 * Hash an OTP using SHA-256 for secure database storage
 */
function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

/**
 * Verify whether plain OTP matches the stored hash
 */
function verifyOtpHash(plainOtp, storedHash) {
  if (!plainOtp || !storedHash) return false;
  const computedHash = hashOtp(plainOtp);
  // Timing-safe comparison to prevent timing attacks
  const bufferA = Buffer.from(computedHash, 'hex');
  const bufferB = Buffer.from(storedHash, 'hex');
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtpHash,
};

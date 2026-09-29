const User = require('./user.model');
const RefreshToken = require('../../models/refreshToken.model');
const { comparePassword, hashPassword } = require('../../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/token');
const { generateOtp, hashOtp, verifyOtpHash } = require('../../utils/otp');
const { hashSha256 } = require('../../utils/crypto');
const emailService = require('../../services/email/email.service');
const { AppError } = require('../../middleware/error.middleware');
const { otp: otpConfig, enforceEmailVerification } = require('../../config/env');
const { toPublicUser } = require('./auth.utils');

/**
 * Register a new local user, send verification OTP and welcome emails
 */
const registerUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  // Generate 6-digit OTP and SHA-256 hash
  const rawOtp = generateOtp(otpConfig.length || 6);
  const otpHash = hashOtp(rawOtp);
  const expiresAt = new Date(Date.now() + (otpConfig.expiresMinutes || 10) * 60 * 1000);

  const user = await User.create({
    email: normalizedEmail,
    password,
    authProvider: 'local',
    emailVerified: false,
    emailVerificationOtpHash: otpHash,
    emailVerificationOtpExpiresAt: expiresAt,
    emailVerificationAttempts: 0,
  });

  // Asynchronously dispatch transactional emails safely
  emailService.sendVerificationOtpEmail({ to: user.email, otp: rawOtp }).catch((err) => {
    console.error('Failed to send verification email:', err);
  });
  emailService.sendWelcomeEmail({ to: user.email }).catch((err) => {
    console.error('Failed to send welcome email:', err);
  });

  return {
    userId: user._id,
    email: user.email,
  };
};

/**
 * Verify email address with 6-digit OTP
 */
const verifyEmail = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    '+emailVerificationOtpHash +emailVerificationOtpExpiresAt +emailVerificationAttempts'
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.emailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const maxAttempts = otpConfig.maxAttempts || 5;
  if (user.emailVerificationAttempts >= maxAttempts) {
    throw new AppError('Too many failed attempts. Please request a new verification code.', 400);
  }

  if (!user.emailVerificationOtpExpiresAt || user.emailVerificationOtpExpiresAt < new Date()) {
    throw new AppError('Verification code has expired. Please request a new code.', 400);
  }

  const isValid = verifyOtpHash(otp, user.emailVerificationOtpHash);
  if (!isValid) {
    user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
    await user.save();
    const remaining = maxAttempts - user.emailVerificationAttempts;
    throw new AppError(
      `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      400
    );
  }

  // Clear OTP fields and mark verified
  user.emailVerified = true;
  user.emailVerificationOtpHash = undefined;
  user.emailVerificationOtpExpiresAt = undefined;
  user.emailVerificationAttempts = 0;
  await user.save();

  return { verified: true, user: toPublicUser(user) };
};

/**
 * Resend verification OTP (generic response to prevent email enumeration)
 */
const resendVerificationOtp = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  // Only issue new OTP if user exists and is not yet verified
  if (user && !user.emailVerified) {
    const rawOtp = generateOtp(otpConfig.length || 6);
    user.emailVerificationOtpHash = hashOtp(rawOtp);
    user.emailVerificationOtpExpiresAt = new Date(
      Date.now() + (otpConfig.expiresMinutes || 10) * 60 * 1000
    );
    user.emailVerificationAttempts = 0;
    await user.save();

    emailService.sendVerificationOtpEmail({ to: user.email, otp: rawOtp }).catch((err) => {
      console.error('Failed to resend verification email:', err);
    });
  }

  // Always return identical generic message
  return {
    message: 'If an account exists with this email, a verification code has been sent.',
  };
};

/**
 * Log in local user and issue access & refresh tokens
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  const passwordMatches =
    user && user.password && (await comparePassword(password, user.password));
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  // Enforce verification if policy enabled
  if (enforceEmailVerification && user.authProvider === 'local' && !user.emailVerified) {
    throw new AppError('Please verify your email address before logging in.', 403);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token in database for lifecycle management and rotation
  const tokenHash = hashSha256(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  return {
    token: accessToken, // Alias for backward compatibility with existing tests
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
};

/**
 * Initiate password recovery (anti-enumeration generic response)
 */
const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && user.authProvider === 'local') {
    const rawOtp = generateOtp(otpConfig.length || 6);
    user.passwordResetOtpHash = hashOtp(rawOtp);
    user.passwordResetOtpExpiresAt = new Date(
      Date.now() + (otpConfig.resetExpiresMinutes || 10) * 60 * 1000
    );
    user.passwordResetAttempts = 0;
    await user.save();

    emailService.sendPasswordResetEmail({ to: user.email, otp: rawOtp }).catch((err) => {
      console.error('Failed to send password reset email:', err);
    });
  }

  return {
    message: 'If an account exists with this email, a password reset code has been sent.',
  };
};

/**
 * Reset password using valid OTP and revoke existing sessions
 */
const resetPassword = async ({ email, otp, newPassword }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+password +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetAttempts'
  );

  if (!user || !user.passwordResetOtpHash) {
    throw new AppError('Invalid or expired password reset code.', 400);
  }

  const maxAttempts = otpConfig.maxAttempts || 5;
  if (user.passwordResetAttempts >= maxAttempts) {
    throw new AppError('Too many failed attempts. Please request a new password reset code.', 400);
  }

  if (!user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt < new Date()) {
    throw new AppError('Password reset code has expired. Please request a new code.', 400);
  }

  const isValid = verifyOtpHash(otp, user.passwordResetOtpHash);
  if (!isValid) {
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    await user.save();
    const remaining = maxAttempts - user.passwordResetAttempts;
    throw new AppError(
      `Invalid password reset code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      400
    );
  }

  // Update password & clear reset OTP fields
  user.password = newPassword;
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpiresAt = undefined;
  user.passwordResetAttempts = 0;
  await user.save();

  // Invalidate all active refresh tokens for security
  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  // Send security notification
  emailService.sendPasswordChangedEmail({ to: user.email }).catch((err) => {
    console.error('Failed to send password changed email:', err);
  });

  return { message: 'Password has been reset successfully. Please log in.' };
};

/**
 * Change password for authenticated user
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const passwordMatches = await comparePassword(currentPassword, user.password);
  if (!passwordMatches) {
    throw new AppError('Current password is incorrect', 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError('New password cannot be the same as current password', 400);
  }

  user.password = newPassword;
  await user.save();

  // Invalidate refresh tokens
  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  emailService.sendPasswordChangedEmail({ to: user.email }).catch((err) => {
    console.error('Failed to send password changed email:', err);
  });

  return { message: 'Password has been changed successfully.' };
};

/**
 * Refresh access token using active refresh token with automatic token rotation
 */
const refreshToken = async (providedRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(providedRefreshToken);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const tokenHash = hashSha256(providedRefreshToken);
  const tokenDoc = await RefreshToken.findOne({ tokenHash });

  if (!tokenDoc || tokenDoc.revokedAt || tokenDoc.expiresAt < new Date()) {
    throw new AppError('Refresh token is invalid or has been revoked.', 401);
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError('User belonging to this token no longer exists', 401);
  }

  // Token Rotation: issue new refresh token and invalidate previous
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const newHash = hashSha256(newRefreshToken);

  tokenDoc.revokedAt = new Date();
  tokenDoc.replacedByTokenHash = newHash;
  await tokenDoc.save();

  await RefreshToken.create({
    userId: user._id,
    tokenHash: newHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken,
  };
};

/**
 * Logout user by revoking their refresh token
 */
const logoutUser = async (providedRefreshToken) => {
  if (providedRefreshToken) {
    const tokenHash = hashSha256(providedRefreshToken);
    await RefreshToken.findOneAndUpdate(
      { tokenHash, revokedAt: null },
      { revokedAt: new Date() }
    );
  }
  return { message: 'Logged out successfully.' };
};

/**
 * Get current user profile
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return toPublicUser(user);
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logoutUser,
  getCurrentUser,
  toPublicUser,
};
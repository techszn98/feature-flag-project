const mongoose = require('mongoose');
const User = require("../auth/user.model");
const RefreshToken = require("../../models/refreshToken.model");
const { generateAccessToken, generateRefreshToken } = require("../../utils/token");
const { hashSha256 } = require("../../utils/crypto");
const emailService = require("../../services/email/email.service");
const googleConfig = require("../../config/google");
const { AppError } = require("../../middleware/error.middleware");
const { toPublicUser } = require("../auth/auth.utils");

const authenticateGoogleUser = async ({ idToken }) => {
  if (!idToken) {
    throw new AppError("Google ID token is required", 400);
  }

  const payload = await googleConfig.verifyGoogleIdToken(idToken);

  if (!payload || !payload.email || payload.email_verified !== true) {
    throw new AppError(
      "Google account is not valid or email is not verified",
      401,
    );
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const googleUserId = payload.sub;

  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { googleId: googleUserId }],
  });

  if (existingUser) {
    if (existingUser.authProvider !== "google") {
      existingUser.authProvider = "google";
    }
    if (!existingUser.googleId) {
      existingUser.googleId = googleUserId;
    }
    if (!existingUser.email) {
      existingUser.email = normalizedEmail;
    }
    existingUser.emailVerified = true;
    await existingUser.save();

    const accessToken = generateAccessToken(existingUser);
    const refreshToken = generateRefreshToken(existingUser);

    if (mongoose.connection.readyState === 1) {
      await RefreshToken.create({
        userId: existingUser._id,
        tokenHash: hashSha256(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: toPublicUser(existingUser),
    };
  }

  const newUser = await User.create({
    email: normalizedEmail,
    googleId: googleUserId,
    authProvider: "google",
    role: "Client",
    emailVerified: true,
  });

  emailService.sendGoogleWelcomeEmail({ to: newUser.email }).catch((err) => {
    console.error("Failed to send Google welcome email:", err);
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  if (mongoose.connection.readyState === 1) {
    await RefreshToken.create({
      userId: newUser._id,
      tokenHash: hashSha256(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: toPublicUser(newUser),
  };
};

module.exports = { authenticateGoogleUser, toPublicUser };

const User = require("../auth/user.model");
const { generateToken } = require("../../utils/jwt");
const googleConfig = require("../../config/google");
const { AppError } = require("../../middleware/error.middleware");

const toPublicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
});

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
    await existingUser.save();

    const token = generateToken(existingUser);
    return { token, user: toPublicUser(existingUser) };
  }

  const newUser = await User.create({
    email: normalizedEmail,
    googleId: googleUserId,
    authProvider: "google",
    role: "Client",
  });

  const token = generateToken(newUser);
  return { token, user: toPublicUser(newUser) };
};

module.exports = { authenticateGoogleUser, toPublicUser };

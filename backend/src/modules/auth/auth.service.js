const User = require('./user.model');
const { comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { AppError } = require('../../middleware/error.middleware');

const toPublicUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
});

const registerUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AppError('Email is already registered', 409);

  const user = await User.create({
    email: normalizedEmail,
    password,
    authProvider: 'local',
  });

  return user._id;
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  const passwordMatches =
    user && user.password && (await comparePassword(password, user.password));
  if (!passwordMatches) throw new AppError('Invalid email or password', 401);

  return { token: generateToken(user), user: toPublicUser(user) };
};

module.exports = { registerUser, loginUser, toPublicUser };
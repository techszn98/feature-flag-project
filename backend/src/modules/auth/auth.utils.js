const toPublicUser = (user) => {
  return {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified || false,
    authProvider: user.authProvider || 'local',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  toPublicUser,
};

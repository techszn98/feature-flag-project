const { AppError } = require("../../middleware/error.middleware");

const validateGoogleLogin = (req, res, next) => {
  const { idToken } = req.body || {};

  if (typeof idToken !== "string" || !idToken.trim()) {
    return next(new AppError("Google ID token is required", 400));
  }

  next();
};

module.exports = {
  validateGoogleLogin,
};

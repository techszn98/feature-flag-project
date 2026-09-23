const { authenticateGoogleUser } = require("./google.service");
const { sendSuccess } = require("../../utils/response");

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const result = await authenticateGoogleUser({
      idToken,
    });

    sendSuccess(res, 200, "Google login successful", result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  googleLogin,
};

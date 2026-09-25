const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.JWT_SECRET = "test-secret";

const User = require("../auth/user.model");
const googleConfig = require("../../config/google");
const { authenticateGoogleUser } = require("./google.service");

test("authenticateGoogleUser creates a user using the shared model and returns a JWT", async () => {
  const originalVerify = googleConfig.verifyGoogleIdToken;
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  try {
    googleConfig.verifyGoogleIdToken = async () => ({
      sub: "google-user-123",
      email: "google.user@example.com",
      email_verified: true,
    });

    User.findOne = async () => null;
    User.create = async (payload) => ({
      _id: "user-123",
      email: payload.email,
      googleId: payload.googleId,
      authProvider: payload.authProvider,
      role: payload.role,
    });

    const result = await authenticateGoogleUser({ idToken: "fake-token" });

    assert.ok(result.token);
    assert.equal(result.user.email, "google.user@example.com");
    assert.equal(result.user.authProvider, "google");
  } finally {
    googleConfig.verifyGoogleIdToken = originalVerify;
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

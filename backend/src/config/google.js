require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!googleClientId) {
  console.warn(
    "GOOGLE_CLIENT_ID is not set. Google sign-in will be disabled until configured.",
  );
}

const client = googleClientId
  ? new OAuth2Client({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectUri: googleRedirectUri,
    })
  : null;

const verifyGoogleIdToken = async (idToken) => {
  if (!client) {
    throw new Error("Google authentication is not configured");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientId,
  });

  return ticket.getPayload();
};

module.exports = {
  verifyGoogleIdToken,
  googleClientId,
  googleClientSecret,
  googleRedirectUri,
  client,
};

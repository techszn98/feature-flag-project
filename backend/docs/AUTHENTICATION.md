# Authentication

## Account Flow

1. `POST /api/v1/auth/register` with an email and password. The API sends a verification code when email delivery is configured.
2. `POST /api/v1/auth/verify-email` with the email and six-digit OTP.
3. `POST /api/v1/auth/login` with the verified account credentials.
4. Send the returned access token in `Authorization: Bearer <access-token>` when using protected project or flag endpoints.

Google sign-in accepts a Google Identity Services ID token at `POST /api/v1/auth/google` or `POST /api/v1/google-auth`. Never place the Google client secret in browser code.

## Tokens and Sessions

Login returns `accessToken`, `refreshToken`, and a legacy `token` alias for the access token. The default access-token lifetime is 15 minutes and the default refresh-token lifetime is 7 days; configure these with `JWT_ACCESS_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN`.

Send the refresh token to `POST /api/v1/auth/refresh` to rotate the session. Store the newly returned pair and discard the old refresh token. `POST /api/v1/auth/logout` accepts the refresh token and revokes that session. Password changes and resets also invalidate sessions.

For browser applications, prefer keeping access tokens in memory and use a backend-for-frontend or appropriately protected cookie strategy for refresh tokens. Do not put long-lived tokens in URLs or logs. The API currently accepts refresh tokens in JSON request bodies; it does not set an HttpOnly cookie itself.

## Password Recovery

- `POST /api/v1/auth/forgot-password` accepts `{ "email": "..." }` and returns a generic response to avoid account enumeration.
- `POST /api/v1/auth/reset-password` accepts `email`, `otp`, and `newPassword`.
- `POST /api/v1/auth/change-password` requires a Bearer access token and accepts `currentPassword` and `newPassword`.

Passwords must be 8-72 characters. OTPs are six digits. OTP lifetime and attempt limits can be set with `OTP_EXPIRES_MINUTES`, `PASSWORD_RESET_OTP_EXPIRES_MINUTES`, and `OTP_MAX_ATTEMPTS`.

## Configuration

Set `JWT_SECRET`; separate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` can be configured. Set `MONGO_URI` or `MONGODB_URI` for MongoDB. Email verification and recovery also need the SMTP variables in `.env.example`. Google sign-in needs `GOOGLE_CLIENT_ID` and the server-side Google configuration.

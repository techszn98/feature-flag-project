# Feature Flag API — Member 6 Integration Guide
## Identity, Authentication, Authorization & Email Communication

Prepared for frontend developers and fellow backend module owners (Projects, Environments, Feature Flags, Evaluation Engine).

---

## 1. Authentication Overview & Token Strategy

The authentication subsystem uses a dual-token lifecycle:
1. **Access Token (Short-lived, 15 minutes):**
   * Transmitted in the HTTP `Authorization` header as a Bearer token:
     ```http
     Authorization: Bearer <access_token>
     ```
   * Payload claims available to downstream middleware and routes:
     ```json
     {
       "id": "673f...",
       "email": "user@example.com",
       "role": "Client", // or "Admin"
       "exp": 1732567890
     }
     ```
2. **Refresh Token (Long-lived, 7 days):**
   * Stored securely as a SHA-256 hash in the database.
   * Exchanged via `POST /api/v1/auth/refresh` to obtain a fresh access token without requiring the user to re-enter credentials.
   * **Automatic Rotation:** Every refresh invalidates the previous refresh token and issues a new pair, preventing replay attacks.
   * **Session Revocation:** Triggered on explicit `POST /api/v1/auth/logout`, password reset, or password change.

---

## 2. API Endpoints Contract

All endpoints are versioned under `/api/v1/auth`.

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register local account; sends OTP & welcome email |
| `POST` | `/api/v1/auth/verify-email` | Public | Verify registration OTP; marks `emailVerified: true` |
| `POST` | `/api/v1/auth/resend-otp` | Public (Rate-limited) | Issue a new verification OTP (anti-enumeration) |
| `POST` | `/api/v1/auth/login` | Public | Log in with email & password; returns tokens |
| `POST` | `/api/v1/auth/google` | Public | Authenticate using Google OAuth ID Token |
| `POST` | `/api/v1/auth/forgot-password` | Public (Rate-limited) | Initiate password reset with OTP (anti-enumeration) |
| `POST` | `/api/v1/auth/reset-password` | Public | Set new password using reset OTP |
| `POST` | `/api/v1/auth/change-password` | Bearer Token | Authenticated password change |
| `GET` | `/api/v1/auth/me` | Bearer Token | Retrieve current authenticated user profile |
| `POST` | `/api/v1/auth/refresh` | Public | Rotate refresh token & obtain new access token |
| `POST` | `/api/v1/auth/logout` | Public / Bearer | Revoke refresh token / end session |

---

## 3. Request & Response Schemas

### 3.1 Registration
**`POST /api/v1/auth/register`**
```json
// Request Body
{
  "email": "developer@example.com",
  "password": "StrongPassword123!"
}

// 201 Created Response
{
  "success": true,
  "message": "Registration successful. Please check your email for your verification code.",
  "data": {
    "userId": "673f4b28198f123456789abc"
  }
}
```

### 3.2 Verify Email OTP
**`POST /api/v1/auth/verify-email`**
```json
// Request Body
{
  "email": "developer@example.com",
  "otp": "483921"
}

// 200 OK Response
{
  "success": true,
  "message": "Email verified successfully. You can now log in.",
  "data": {
    "verified": true,
    "user": {
      "id": "673f4b28198f123456789abc",
      "email": "developer@example.com",
      "role": "Client",
      "emailVerified": true,
      "authProvider": "local"
    }
  }
}
```

### 3.3 Login
**`POST /api/v1/auth/login`**
```json
// Request Body
{
  "email": "developer@example.com",
  "password": "StrongPassword123!"
}

// 200 OK Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "token": "eyJhbGciOi...", // Alias for backward compatibility
    "user": {
      "id": "673f4b28198f123456789abc",
      "email": "developer@example.com",
      "role": "Client",
      "emailVerified": true,
      "authProvider": "local"
    }
  }
}
```

### 3.4 Google Single Sign-On (SSO)
**`POST /api/v1/auth/google`**
* **Frontend Requirement:** Acquire the Google ID Token via Google Identity Services (`google.accounts.id`) and send it in the request body. **Never expose `GOOGLE_CLIENT_SECRET` to frontend code.**
```json
// Request Body
{
  "idToken": "<JWT_ID_TOKEN_FROM_GOOGLE_SDK>"
}

// 200 OK Response
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "673f4b28198f123456789abc",
      "email": "developer@gmail.com",
      "role": "Client",
      "emailVerified": true,
      "authProvider": "google"
    }
  }
}
```

### 3.5 Token Refresh & Rotation
**`POST /api/v1/auth/refresh`**
```json
// Request Body
{
  "refreshToken": "<current_refresh_token>"
}

// 200 OK Response
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "<new_short_lived_token>",
    "refreshToken": "<new_rotated_refresh_token>"
  }
}
```

### 3.6 Password Recovery (Anti-Enumeration)
**`POST /api/v1/auth/forgot-password`**
```json
// Request Body
{
  "email": "developer@example.com"
}

// 200 OK Response (Identical response whether email exists or not)
{
  "success": true,
  "message": "If an account exists with this email, a password reset code has been sent.",
  "data": null
}
```

**`POST /api/v1/auth/reset-password`**
```json
// Request Body
{
  "email": "developer@example.com",
  "otp": "729104",
  "newPassword": "NewStrongPassword123!"
}

// 200 OK Response
{
  "success": true,
  "message": "Password has been reset successfully. Please log in.",
  "data": null
}
```

---

## 4. Backend Module Integration (Projects, Environments, Flags)

### Accessing the Authenticated User in Handlers
All routes protected by [`protect`](file:///c:/Users/sheri/feature-flag-project/backend/src/middleware/auth.middleware.js) attach the full user document to `req.user`:
```javascript
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

router.get('/projects', protect, listProjects);
router.post('/admin-settings', protect, authorize('Admin'), updateSettings);
```

### Available Properties on `req.user`:
* `req.user._id`: Mongoose ObjectId of the user (e.g. project `ownerId`).
* `req.user.email`: User's normalized email string.
* `req.user.role`: `'Client'` or `'Admin'`.
* `req.user.emailVerified`: Boolean.
* `req.user.authProvider`: `'local'` or `'google'`.

> [!IMPORTANT]
> Always scope database queries by `req.user._id`. Never trust an `ownerId` supplied directly in request bodies or query parameters.

---

## 5. Security Guarantees & Safeguards
1. **No Plaintext Secrets in Database:**
   * Passwords hashed with `bcryptjs` (salt rounds: 10).
   * Verification & Reset OTPs hashed using SHA-256 (`select: false`).
   * Refresh tokens stored as SHA-256 hashes with automatic TTL expiration.
2. **Brute Force Protection:**
   * Maximum 5 attempts allowed per OTP before mandatory re-issuance.
   * Strict rate limiting on auth endpoints via `express-rate-limit`.
3. **Anti-Enumeration Protection:**
   * Generic status and messages on `/resend-otp` and `/forgot-password` to prevent attackers from discovering valid email registrations.
4. **Email Safeguards:**
   * Real SMTP delivery runs asynchronously so that temporary mail server delays do not block API execution.
   * Internal SMTP credentials and raw error traces are masked and never exposed to clients.

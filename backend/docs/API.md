# API Reference

Base URL: `http://localhost:3000/api/v1`. All request and response bodies use JSON. Successful responses use `{ "success": true, "message": "...", "data": ... }`; errors use `{ "success": false, "message": "...", "data": null }`.

The complete machine-readable contract is [openapi.yaml](openapi.yaml). Authentication endpoints that send OTPs require the email delivery configuration described in [AUTHENTICATION.md](AUTHENTICATION.md).

## Health

| Method | Path      | Access | Description                                    |
| ------ | --------- | ------ | ---------------------------------------------- |
| GET    | `/health` | Public | Process liveness. Does not check the database. |

## Authentication

All paths below are relative to `/api/v1/auth` unless otherwise noted.

| Method | Path               | Access       | Description                                                               |
| ------ | ------------------ | ------------ | ------------------------------------------------------------------------- |
| POST   | `/register`        | Public       | Create an account and send verification OTP. Body: `email`, `password`.   |
| POST   | `/verify-email`    | Public       | Verify email with `email`, `otp`.                                         |
| POST   | `/resend-otp`      | Public       | Request a verification OTP with `email`.                                  |
| POST   | `/login`           | Public       | Authenticate with `email`, `password`; returns access and refresh tokens. |
| POST   | `/google`          | Public       | Authenticate with Google `idToken`.                                       |
| POST   | `/forgot-password` | Public       | Begin password recovery with `email`.                                     |
| POST   | `/reset-password`  | Public       | Reset using `email`, `otp`, `newPassword`.                                |
| POST   | `/change-password` | Bearer token | Change password with `currentPassword`, `newPassword`.                    |
| GET    | `/me`              | Bearer token | Return the authenticated user's profile.                                  |
| POST   | `/refresh`         | Public       | Rotate the session using `refreshToken`.                                  |
| POST   | `/logout`          | Public       | Revoke the session using `refreshToken`.                                  |

Google sign-in is also mounted at `POST /api/v1/google-auth` for compatibility.

## Projects

All project endpoints require a Bearer access token. Project records are scoped to the authenticated user.

| Method | Path                    | Description                                                    |
| ------ | ----------------------- | -------------------------------------------------------------- |
| POST   | `/projects`             | Create with `name`; optional `slug`, `description`.            |
| GET    | `/projects`             | List the authenticated user's projects.                        |
| GET    | `/projects/{projectId}` | Fetch one owned project.                                       |
| PATCH  | `/projects/{projectId}` | Update `name`, `slug`, and/or `description`.                   |
| DELETE | `/projects/{projectId}` | Delete an owned project with no environments; otherwise `409`. |

## Environments and Keys

Environment and key-management routes require a Bearer access token and verify project ownership.

| Method | Path                                 | Description                                                                               |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| POST   | `/projects/{projectId}/environments` | Create an environment with `name` and `type` (`development`, `staging`, or `production`). |
| GET    | `/projects/{projectId}/environments` | List environments in an owned project.                                                    |
| GET    | `/environments/{id}`                 | Fetch an owned environment.                                                               |
| PUT    | `/environments/{id}`                 | Update an owned environment.                                                              |
| DELETE | `/environments/{id}`                 | Delete an owned environment.                                                              |
| POST   | `/environments/{id}/keys`            | Create a key; the raw key is returned once.                                               |
| GET    | `/environments/{id}/keys`            | List key previews for an owned environment.                                               |
| DELETE | `/environments/{id}/keys/{keyId}`    | Revoke a key in an owned environment.                                                     |

Environment keys are stored as hashes and are intended for server-side runtime evaluation, not public browser code.
Deleting an environment cascades to its keys, flags, and identities. Deleting a project that still has environments returns `409`; delete its environments first.

## Feature Flags

All flag-management endpoints require a Bearer access token. Every flag references an existing environment in a project owned by the authenticated user.

| Method | Path          | Description                                                                          |
| ------ | ------------- | ------------------------------------------------------------------------------------ |
| POST   | `/flags`      | Create with `environmentId`, `name`; optional `enabled` and `targetingRules`.        |
| GET    | `/flags`      | List the owner's flags; optionally filter with `?environmentId={id}`.                |
| GET    | `/flags/{id}` | Fetch one owned flag.                                                                |
| PUT    | `/flags/{id}` | Update `name`, `enabled`, and/or `targetingRules`; environment binding is immutable. |
| DELETE | `/flags/{id}` | Delete one owned flag.                                                               |

Flag names are unique within an environment. A duplicate returns `409`; unknown or unowned environments return `404`.

Targeting rules contain `trait`, `operator`, `value`, and boolean `enabled`. Operators are `equals`, `notEquals`, `in`, `notIn`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `contains`, and `exists`. Rules are evaluated in order; the first matching rule wins, otherwise the flag's default `enabled` value is used.

## Identities

All identity endpoints require a Bearer access token. Create an identity with an `environmentId` belonging to a project owned by the authenticated user. Identity identifiers are unique within an environment, so the same identifier can exist in another environment without sharing traits. Every endpoint that uses `{identifier}` requires the `environmentId` query parameter.

| Method | Path                                                            | Description                                                              |
| ------ | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| POST   | `/identities`                                                   | Create with `environmentId`, `identifier`, and optional object `traits`. |
| GET    | `/identities/{identifier}?environmentId={environmentId}`        | Fetch one identity in the selected environment.                          |
| PUT    | `/identities/{identifier}?environmentId={environmentId}`        | Update `identifier` and/or replace the full `traits` object.             |
| PUT    | `/identities/{identifier}/traits?environmentId={environmentId}` | Merge supplied top-level traits into existing traits.                    |
| DELETE | `/identities/{identifier}?environmentId={environmentId}`        | Delete the identity in the selected environment.                         |

Example create body:

```json
{
  "environmentId": "673f4b28198f123456789abc",
  "identifier": "user_123",
  "traits": {
    "plan": "premium",
    "country": "Nigeria",
    "age": 25
  }
}
```

The service verifies ownership through the environment's parent project before every operation. Unknown or unowned environments and identities return `404`; duplicate identifiers within an environment return `409`. Trait updates only store data and never make feature-targeting decisions.

## Evaluation

`POST /evaluate` uses `X-Environment-Key`, not a user JWT. The key selects the environment and cannot be overridden by the request body. Send `{ "identifier": "user_123" }`; the service reads traits through the existing identity model and returns `data.flags` as a name-to-boolean map. If no identity exists, empty traits are used and each flag's default state is returned. Missing, invalid, revoked, or stale keys return `401`.

## Status Codes

`400` invalid input or identifier; `401` missing/invalid authentication; `404` resource not found or not owned; `409` duplicate resource; `429` rate limit exceeded; `500` unexpected server error.

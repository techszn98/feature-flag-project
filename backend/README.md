# Feature Flag API

A Node.js and Express API for account authentication, projects, and owner-scoped feature-flag management. MongoDB is used for persistence.

## Implementation Status

Implemented and mounted modules:

- Authentication, email verification, password recovery, refresh-token rotation, and Google sign-in.
- User-owned project CRUD.
- Project environments and environment-key management.
- Environment-bound feature-flag CRUD with ordered trait targeting rules.
- Environment-scoped identity CRUD and identity traits.
- Environment-key-authenticated flag evaluation.
- `GET /api/v1/health` liveness endpoint.

Evaluation consumes flags and traits but never creates or modifies identities. The first matching targeting rule overrides the flag's default `enabled` value; if no rule matches, the default is returned.

## Requirements

- Node.js 18 or newer.
- MongoDB 6 or newer, local or hosted.
- A `JWT_SECRET` and a MongoDB connection string. Email and Google configuration are needed for those optional flows.

## Run Locally

From this directory:

```powershell
Copy-Item .env.example .env
npm ci
```

Set `MONGO_URI` or `MONGODB_URI` and `JWT_SECRET` in `.env`, then start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:3000` by default. Check `http://localhost:3000/api/v1/health` for liveness. The health endpoint does not verify MongoDB readiness.

## Run Tests

```powershell
npm test
```

The integration tests use an in-memory MongoDB instance. Rate limiting is disabled only when `NODE_ENV=test`.

## Feature Flag Example

After registering, verifying the account if required, and logging in, send the access token as a Bearer token:

```http
POST /api/v1/flags
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "name": "new_checkout",
  "environmentId": "673f4b28198f123456789abc",
  "enabled": false,
  "targetingRules": [
    {
      "trait": "plan",
      "operator": "equals",
      "value": "premium",
      "enabled": true
    }
  ]
}
```

Flags belong to an existing environment in a project owned by the authenticated user. Runtime evaluation uses that environment's key:

```http
POST /api/v1/evaluate
X-Environment-Key: <environment-key>
Content-Type: application/json
```

```json
{ "identifier": "user_123" }
```

The key chooses the environment. Evaluation reads that identity's traits and returns a `flags` object of name-to-boolean results. See the [API reference](docs/API.md) for details.

## Documentation

- [API reference](docs/API.md)
- [OpenAPI 3.0 specification](docs/openapi.yaml)
- [Authentication](docs/AUTHENTICATION.md)
- [Security](docs/SECURITY.md)
- [Production deployment](docs/DEPLOYMENT.md)
- [Architecture and implementation status](docs/ARCHITECTURE.md)
- [JavaScript SDK](sdk/javascript/README.md)
- [Existing integration guide](INTEGRATION_GUIDE.md)

## Docker Compose Deployment

Compose expects a public DNS name, rotated secret files under `SECRETS_DIR`, and an authenticated TLS-enabled MongoDB connection string. Follow [the deployment guide](docs/DEPLOYMENT.md) before starting it:

```powershell
docker compose up -d --build
```

The API is private behind Caddy, which obtains and renews TLS certificates. Redis provides shared rate-limit state; a backup worker writes scheduled compressed MongoDB archives to `BACKUP_DIR`. Use encrypted, off-host storage and test restores for production recovery.

# Security

## Current Controls

- Protected project, flag, identity, and key-management routes authenticate a Bearer token and verify ownership through the parent project.
- Flag inputs validate environment references, names, boolean state, targeting rules, unknown fields, and MongoDB IDs. Duplicate names within an environment are rejected.
- Runtime evaluation accepts a hashed, non-revoked environment key in `X-Environment-Key`; the request cannot select or override the key's environment.
- Helmet security headers, configured CORS, a 10 KB JSON body limit, and request sanitization are applied in the Express application.
- API-wide and authentication rate limits are enabled outside test mode. OTP routes have an additional limiter.
- Passwords and OTP/session secrets are stored as hashes; refresh tokens rotate and can be revoked.
- Unexpected server errors are returned without exposing internal stack traces. Do not log credentials, OTPs, or bearer tokens.

## Deployment Requirements

- Keep `.env`, `secrets/`, and `backups/` out of source control. Compose passes file-mounted secrets to the API; production platforms should use their native secret manager.
- Caddy terminates TLS and the API is not directly published. Restrict `PRODUCTION_FRONTEND_URL` to trusted origins; CORS is not an authorization mechanism.
- Use an authenticated MongoDB user with least privilege and a TLS-enabled URI. Compose expects a managed/external MongoDB service rather than exposing a Mongo container.
- Redis is private to the Compose data network, password-protected, and used as the shared rate-limit store. Production replicas must share this Redis service or another compatible store.
- The backup worker writes compressed dumps to `BACKUP_DIR` and prunes local archives by retention age. Use encrypted off-host storage or managed MongoDB snapshots as an additional recovery layer, and regularly test restores.
- The health endpoint is public and only reports process liveness; do not use it as a database-readiness guarantee.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Compose prerequisites, secret-file setup, TLS, and backup operation.

## Scope Limitations

Identity traits are data only; the evaluation module applies targeting using flags in the key's environment. Rules use first-match precedence, with the flag's default state as fallback. See [ARCHITECTURE.md](ARCHITECTURE.md).

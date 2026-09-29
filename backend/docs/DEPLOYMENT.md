# Production Compose Deployment

This Compose stack runs the API behind Caddy, uses Redis for shared rate-limit state, and connects to an external MongoDB deployment. MongoDB credentials, JWT signing keys, Redis password, and optional provider credentials are mounted as files; they are not passed through Compose `env_file`.

## Prerequisites

- A server with Docker Compose v2 and ports 80/443 available.
- A DNS `A`/`AAAA` record for the API domain pointing to that server.
- A managed MongoDB deployment with TLS enabled and a least-privilege application user. Restrict database network access to the server's egress IP where possible.
- A trusted frontend origin.

## Configure

1. Set `PUBLIC_DOMAIN`, `PRODUCTION_FRONTEND_URL`, `SECRETS_DIR`, and `BACKUP_DIR` in `.env`. The `example.com` values in `.env.example` are placeholders, not production defaults.
2. Create the directory named by `SECRETS_DIR`. Create these files inside it, one value per file:
   - `mongo_uri`: authenticated, TLS-enabled URI for the application database.
   - `jwt_secret`, `jwt_access_secret`, `jwt_refresh_secret`: independent, high-entropy signing secrets.
   - `redis_password`: a strong random password for the private Redis service.
   - `google_client_secret`: rotated Google OAuth client secret, or an empty file if Google sign-in is unused.
   - `email_password`: SMTP password, or an empty file if outbound email is unused.
3. Set non-secret Google/SMTP options in `.env` as needed. The API reads `*_FILE` values from the mounted files; direct environment variables remain supported for local development.

Generate the JWT and Redis values locally without printing them to the terminal:

```powershell
New-Item -ItemType Directory -Force .\secrets
node -e 'const fs = require("node:fs"); const crypto = require("node:crypto"); for (const name of ["jwt_secret", "jwt_access_secret", "jwt_refresh_secret", "redis_password"]) fs.writeFileSync("secrets/" + name, crypto.randomBytes(48).toString("base64url"), { flag: "wx", mode: 0o600 });'
```

Create `mongo_uri`, `google_client_secret`, and `email_password` securely using your database/provider consoles and a local editor. Do not paste secret values into source files, chat, shell history, or Postman collection exports. Ensure the secret directory is owner-readable only; Windows deployments should apply an equivalent restrictive ACL.

The Mongo URI should use `mongodb+srv://` or explicitly enable TLS, and should identify the application database. The database account should not have administrative privileges.

## Start and Verify

Allow inbound TCP 80/443 (and UDP 443 for HTTP/3). Caddy obtains and renews certificates automatically once DNS resolves correctly.

```powershell
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs -f api caddy mongo-backup
```

The API has no published host port; access it through `https://<PUBLIC_DOMAIN>`. Redis is only attached to the internal data network. Production rate limiting fails to start without Redis configuration instead of silently reverting to per-process memory.

## Backups and Recovery

`mongo-backup` runs `mongodump` immediately and then at `BACKUP_INTERVAL_SECONDS` (default: daily). Compressed archives are written to `BACKUP_DIR`; archives older than `BACKUP_RETENTION_DAYS` are removed. Monitor the worker logs and backup storage capacity.

The local archive directory is not, by itself, a disaster-recovery plan. Mount `BACKUP_DIR` to encrypted persistent storage replicated off the API host, enable your managed MongoDB provider's snapshots/point-in-time recovery, and periodically restore an archive into a staging database. Protect backup access as carefully as database access.

## Credential Rotation

Credentials previously stored directly in `.env` must be rotated before production use. Update the secret files after rotation. Changing JWT secrets invalidates existing sessions; revoking/replacing the MongoDB and Google credentials prevents continued use of exposed values.

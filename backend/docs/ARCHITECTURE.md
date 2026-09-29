# Architecture and Integration Status

## Runtime Assembly

`src/server.js` loads configuration, connects to MongoDB, and starts the Express application from `src/app.js`. The app configures query parsing, Helmet, CORS, JSON parsing, body sanitization, rate limiting, a public health route, mounted API routers, and centralized not-found/error handling.

| Module           | Mount                           | Current responsibility                                                              |
| ---------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| Auth             | `/api/v1/auth`                  | Registration, email verification, login, sessions, password recovery, current user. |
| Google auth      | `/api/v1/google-auth`           | Google ID-token sign-in; also reachable through the auth router.                    |
| Projects         | `/api/v1/projects`              | Owner-scoped project CRUD.                                                          |
| Environments     | `/api/v1/environments`          | Project environments, with nested project routes for creation/listing.              |
| Environment keys | `/api/v1/environments/:id/keys` | Create, list, and revoke keys for an environment.                                   |
| Flags            | `/api/v1/flags`                 | Environment-bound flag CRUD and ordered targeting-rule configuration.               |
| Identities       | `/api/v1/identities`            | Identity and trait CRUD scoped to an owned environment.                             |
| Evaluation       | `/api/v1/evaluate`              | Environment-key-authenticated flag decisions using identity traits.                 |

## Request Flow

```text
HTTP request
  -> Express security, parsing, sanitization, and rate-limit middleware
  -> versioned router and request validators
  -> authentication middleware for protected routes
  -> controller -> service -> Mongoose model -> MongoDB
  -> shared success/error response envelope
```

Project, environment, key, flag, and identity management verify ownership through the parent project. Flags reference an `environmentId` and are unique by `(environmentId, name)`. Identities are unique by `(environmentId, identifier)`. Evaluation validates the presented environment key, then reads flags and traits only for that key's environment.

## Resource Deletion

Deleting an environment removes its environment keys, flags, and identities before removing the environment. A project with any environments cannot be deleted (`409`); delete each environment first. This policy avoids silently deleting an entire project tree while preventing orphaned environment-scoped records.

## Requested Product Chain

The currently assembled portion is:

```text
Authentication -> Projects -> Environments -> Environment Keys
                                      -> Feature Flags -> Evaluation
                                      -> Identities and Traits -> Targeting decisions
```

The evaluation module owns runtime targeting decisions and consumes the existing identity service; it does not create a second identity model. Identity management only stores and returns traits.

## Integration Checks

Run `npm test` from the backend directory. The suite exercises auth, projects, environments, environment keys, flags, identities, evaluation, targeting, validation, and ownership/environment isolation through the assembled Express app. The app-level rate limiters skip requests only when `NODE_ENV=test`; runtime limits remain enabled.

## Deployment Boundary

`Dockerfile` and `docker-compose.yml` provide a local API + MongoDB run. The health route verifies only that Express responds; database readiness is checked by Compose's MongoDB health check before the API starts. Production hosting, TLS termination, secret management, database authentication, backups, and shared rate-limit storage remain deployment-environment responsibilities.

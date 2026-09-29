# Environments & Environment Keys Module

Owned by Member 4. Handles project environments (development, staging, production) and their environment keys.

## Postman Collection

All requests below require a JWT token, obtained from `/api/v1/auth/login`.

Set it in Postman under **Authorization → Bearer Token** for every request.

---

### 1. Create a Project

```
POST /api/v1/projects
```

**Body**
```json
{
  "name": "My Feature Flag Project",
  "description": "Capstone test project"
}
```

Copy the `_id` from the response — that's your `projectId` for every step below.

---

### 2. Create an Environment

```
POST /api/v1/projects/:projectId/environments
```

Replace `:projectId` with the real id from step 1.

**Body**
```json
{
  "name": "Development Server",
  "type": "development"
}
```

`type` must be one of: `development`, `staging`, `production`.

Copy the `_id` from the response — that's your `environmentId` for everything below.

---

### 3. List Environments for a Project

```
GET /api/v1/projects/:projectId/environments
```

No body.

---

### 4. Get One Environment

```
GET /api/v1/environments/:id
```

`:id` = your `environmentId`. No body.

---

### 5. Update an Environment

```
PUT /api/v1/environments/:id
```

**Body**
```json
{
  "name": "Renamed Dev Server"
}
```

---

### 6. Create an Environment Key

```
POST /api/v1/environments/:id/keys
```

`:id` = your `environmentId`. Body is optional.

**Body**
```json
{
  "label": "My Test Key"
}
```

⚠️ Copy the `key` field from the response right now — it's shown only once and cannot be retrieved again.

---

### 7. List Keys for an Environment

```
GET /api/v1/environments/:id/keys
```

No body. Response includes `keyPreview` only — the `hashedKey` field must never appear here.

---

### 8. Revoke a Key

```
DELETE /api/v1/environments/:id/keys/:keyId
```

`:keyId` = the key's `_id` from step 6. No body.

---

### 9. Delete an Environment

```
DELETE /api/v1/environments/:id
```

No body. Test this last.

---

## Quick Reference

| # | Method | Endpoint | Body? |
|---|--------|----------|-------|
| 1 | POST   | `/projects` | ✅ Yes |
| 2 | POST   | `/projects/:projectId/environments` | ✅ Yes |
| 3 | GET    | `/projects/:projectId/environments` | ❌ No |
| 4 | GET    | `/environments/:id` | ❌ No |
| 5 | PUT    | `/environments/:id` | ✅ Yes |
| 6 | POST   | `/environments/:id/keys` | ✅ Optional |
| 7 | GET    | `/environments/:id/keys` | ❌ No |
| 8 | DELETE | `/environments/:id/keys/:keyId` | ❌ No |
| 9 | DELETE | `/environments/:id` | ❌ No |

## Security Notes

- Environment keys are never stored in raw form. Only a SHA-256 hash is saved (`key.model.js`).
- The raw key is returned to the client exactly once, at creation time, and cannot be retrieved afterward.
- `GET /environments/:id/keys` always excludes the `hashedKey` field from its response.

## Tests

```
tests/environments/environment.test.js
tests/environment-keys/key.test.js
tests/environment-keys/key-security.test.js
```

Run with:
```bash
npm test
```
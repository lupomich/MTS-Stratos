# Authentication System - MTS-Stratos

Current authentication and session model across Node.js and Java backends.

## Runtime Scope

- Authentication state is shared across both frontends and both backends.
- Frontend Node target: http://localhost:3001
- Frontend Java target: http://localhost:3002
- Node backend API: http://localhost:3000
- Java backend API: http://localhost:3003 (host) -> 3001 (container)
- Shared state stores: PostgreSQL + Redis

## Session Model

Single-session policy is enforced per user account.

- A successful login sets:
  - `users.is_logged_in = true`
  - `users.active_session_id`
  - `users.active_session_at`
  - Redis key `auth:online:{userId}` with TTL
- A second login with the same user while session is active returns:
  - `409` with `code: ALREADY_LOGGED_IN`
- Session stale logic clears old sessions automatically when idle timeout is exceeded.
- Heartbeat endpoint keeps active sessions alive.

## Authentication Endpoints (Implemented)

All routes are prefixed with `/api`.

### Auth

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/heartbeat`
- `POST /auth/logout`

### Users (admin)

- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Preferences

- `GET /preferences`
- `GET /preferences/ui_settings`
- `PUT /preferences/ui_settings`

### Workspaces

- `GET /workspaces`
- `POST /workspaces`
- `PUT /workspaces/:id`
- `PUT /workspaces/:id/activate`
- `DELETE /workspaces/:id`

### Health

- `GET /health`

## Expected HTTP Response Codes

### Auth endpoints

| Endpoint | 200 | 400 | 401 | 409 | 500 |
|---|---|---|---|---|---|
| `POST /auth/login` | OK — token returned | Missing fields | Wrong credentials | `ALREADY_LOGGED_IN` — session active | Server/DB error |
| `GET /auth/me` | OK — user info | — | No/invalid token | — | Server/DB error |
| `POST /auth/heartbeat` | OK — session extended | — | No/invalid token | — | Server/DB error |
| `POST /auth/logout` | OK — session cleared | — | No/invalid token | — | Server/DB error |

### Health endpoint

| Endpoint | 200 | 5xx |
|---|---|---|
| `GET /health` | Service up | Service unavailable |

## CORS Behavior

Node backend allows requests from both frontend origins:

- `http://localhost:3001`
- `http://localhost:3002`
- `http://bondvision-digital:3001`
- `http://bondvision-digital:3002`
- `CORS_ORIGIN` from environment (if set)

## Start Commands

### Node stack only

```bash
docker compose -f docker-compose.master.yml up -d --build
```

### Full dual stack

```bash
docker compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up -d --build
```

## Quick Verification

```bash
# Health checks
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3003/api/health
curl.exe http://localhost:3001/api/health
curl.exe http://localhost:3002/api/health
```

## Typical Login Troubleshooting

### Symptom: "User already logged in"

This is expected when a session is already active for the same user.

1. Check current user state in DB:

```powershell
docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c "SELECT username, is_logged_in, active_session_id, active_session_at FROM users WHERE username='admin';"
```

2. Check Redis online key:

```powershell
$uid = docker exec mts-stratos-postgres psql -U stratos -d stratos_db -t -A -c "SELECT id::text FROM users WHERE username='admin' LIMIT 1;"
$uid = $uid.Trim()
docker exec mts-stratos-redis redis-cli GET "auth:online:$uid"
```

3. Force unlock user session (admin/support use):

```powershell
$uid = docker exec mts-stratos-postgres psql -U stratos -d stratos_db -t -A -c "SELECT id::text FROM users WHERE username='admin' LIMIT 1;"
$uid = $uid.Trim()
docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL WHERE username = 'admin';"
if ($uid) { docker exec mts-stratos-redis redis-cli DEL "auth:online:$uid" }
```

## Operational Notes

- Do not login with the same user simultaneously on both frontends unless testing conflict behavior.
- For parallel UI testing, use different users per frontend.
- Java and Node backends currently use separate JWT secrets; tokens are not cross-validatable by design in this setup.

## Logs

```bash
docker logs -f mts-stratos-backend
docker logs -f mts-stratos-backend-java
docker logs -f mts-stratos-bondvision-digital
docker logs -f mts-stratos-bondvision-digital-java
```

## Last Update

- Date: 2026-03-16
- Scope: aligned to dual frontend + dual backend runtime and current session behavior


**System Status:** ✅ Production Ready
**Last Updated:** February 18, 2026

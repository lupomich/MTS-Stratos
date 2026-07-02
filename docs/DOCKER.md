# Docker Runtime Guide - MTS-Stratos

Current Docker configuration for the workspace, aligned with the active dual-frontend/dual-backend setup.

## Active Topology

| Layer | Service | Container | Host URL | Port Mapping |
|---|---|---|---|---|
| Frontend | BondVision Digital (Node target) | `mts-stratos-bondvision-digital` | http://localhost:3001 | `3001:3001` |
| Frontend | BondVision Digital (Java target) | `mts-stratos-bondvision-digital-java` | http://localhost:3002 | `3002:3002` |
| Backend | Node.js API | `mts-stratos-backend` | http://localhost:3000 | `3000:3000` |
| Backend | Java API (Micronaut) | `mts-stratos-backend-java` | http://localhost:3003 | `3003:3001` |
| Database | PostgreSQL | `mts-stratos-postgres` | localhost:5432 | `5432:5432` |
| Cache | Redis | `mts-stratos-redis` | localhost:6379 | `6379:6379` |
| Admin | pgAdmin | `mts-stratos-pgadmin` | http://localhost:5050 | `5050:80` |
| Testing | Playwright E2E | `mts-stratos-e2e` | localhost:9323 | `9323:9323` |

## Compose Files

- `docker-compose.master.yml`: Node backend + Node-target frontend + shared services.
- `docker-compose.java-backend.yml`: Java backend + Java-target frontend overlay.

## Start and Stop

### Node stack only

```bash
docker compose -f docker-compose.master.yml up -d --build
```

### Full dual stack (Node + Java + both frontends)

```bash
docker compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up -d --build
```

### Stop full dual stack

```bash
docker compose -f docker-compose.master.yml -f docker-compose.java-backend.yml down
```

## Frontend to Backend Routing

- `http://localhost:3001` (Node frontend) routes `/api` to `http://bondvision-backend:3000`
- `http://localhost:3002` (Java frontend) routes `/api` to `http://bondvision-backend-java:3001`

Configured by frontend environment variables:

- `VITE_PORT`
- `VITE_BACKEND_TARGET`
- `VITE_BACKEND_URL=/api`

## CORS and Authentication Notes

- Node backend accepts frontend origins on both `localhost:3001` and `localhost:3002`.
- Session policy is single-login per user across both frontends (shared DB + Redis).
- If the same user logs in on one frontend, the other frontend may receive `ALREADY_LOGGED_IN`.

## Quick Verification

```bash
# Container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Frontend availability
curl.exe http://localhost:3001
curl.exe http://localhost:3002

# Direct backend health
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3003/api/health

# Health via frontend proxies
curl.exe http://localhost:3001/api/health
curl.exe http://localhost:3002/api/health
```

## Logs

```bash
docker logs -f mts-stratos-bondvision-digital
docker logs -f mts-stratos-bondvision-digital-java
docker logs -f mts-stratos-backend
docker logs -f mts-stratos-backend-java
docker logs -f mts-stratos-postgres
docker logs -f mts-stratos-redis
```

## Session Unlock (Admin/Support)

Use this only for troubleshooting when a user is stuck with `ALREADY_LOGGED_IN`.

```powershell
$uid = docker exec mts-stratos-postgres psql -U stratos -d stratos_db -t -A -c "SELECT id::text FROM users WHERE username='admin' LIMIT 1;"
$uid = $uid.Trim()
docker exec mts-stratos-postgres psql -U stratos -d stratos_db -c "UPDATE users SET is_logged_in = false, active_session_id = NULL, active_session_at = NULL WHERE username = 'admin';"
if ($uid) { docker exec mts-stratos-redis redis-cli DEL "auth:online:$uid" }
```

## Persistent Volumes

| Volume | Purpose |
|---|---|
| `postgres-data` | PostgreSQL persistent data |
| `redis-data` | Redis persistent data |
| `pgadmin-data` | pgAdmin saved connections and settings |

## Maintenance

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup (dangerous)
docker system prune -a --volumes
```

## Last Update

- Date: 2026-03-16
- Scope: Updated to current dual-frontend + dual-backend runtime configuration


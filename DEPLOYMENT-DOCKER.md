# Docker Deployment Guide — MTS-Stratos

## Current Runtime Topology

| Layer | Service | Container | Host URL | Ports |
|---|---|---|---|---|
| Frontend | BondVision Digital (Node target) | `mts-stratos-bondvision-digital` | http://localhost:3001 | `3001:3001` |
| Frontend | BondVision Digital (Java target) | `mts-stratos-bondvision-digital-java` | http://localhost:3002 | `3002:3002` |
| Backend | Node.js API | `mts-stratos-backend` | http://localhost:3000 | `3000:3000` |
| Backend | Java API (Micronaut) | `mts-stratos-backend-java` | http://localhost:3003 | `3003:3001` |
| Database | PostgreSQL | `mts-stratos-postgres` | localhost:5432 | `5432:5432` |
| Cache | Redis | `mts-stratos-redis` | localhost:6379 | `6379:6379` |
| Admin | pgAdmin | `mts-stratos-pgadmin` | http://localhost:5050 | `5050:80` |

## Compose Files

- `docker-compose.master.yml`: Node backend + Node-target frontend + DB + Redis + pgAdmin + E2E
- `docker-compose.java-backend.yml`: Java backend + Java-target frontend overlay

## Start Commands

### Start Node-only stack

```bash
docker compose -f docker-compose.master.yml up -d --build
```

### Start dual stack (Node + Java + both frontends)

```bash
docker compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up -d --build
```

### Stop stack

```bash
docker compose -f docker-compose.master.yml -f docker-compose.java-backend.yml down
```

## Frontend ↔ Backend Routing

- `http://localhost:3001` uses `/api` proxy to `http://bondvision-backend:3000` (Node.js)
- `http://localhost:3002` uses `/api` proxy to `http://bondvision-backend-java:3001` (Java)

This is controlled by frontend environment variables:

- `VITE_PORT`
- `VITE_BACKEND_TARGET`
- `VITE_BACKEND_URL=/api`

## Verification

```bash
# Container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Frontend reachability
curl.exe http://localhost:3001
curl.exe http://localhost:3002

# Backend direct health
curl.exe http://localhost:3000/api/health
curl.exe http://localhost:3003/api/health

# Health through each frontend proxy
curl.exe http://localhost:3001/api/health
curl.exe http://localhost:3002/api/health
```

## Logs

```bash
# Frontend (Node target)
docker logs -f mts-stratos-bondvision-digital

# Frontend (Java target)
docker logs -f mts-stratos-bondvision-digital-java

# Node backend
docker logs -f mts-stratos-backend

# Java backend
docker logs -f mts-stratos-backend-java
```

## Notes

1. The Java backend is exposed on host port `3003` to keep host port `3001` available for the Node-target frontend.
2. The Java backend still listens on container port `3001`; only host mapping differs.
3. Use `docker compose` (space) for all new commands.

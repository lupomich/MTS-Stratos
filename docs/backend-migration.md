# Backend Migration Plan: Node.js → Micronaut (Java)

**Status:** Draft — Awaiting Approval  
**Date:** 2026-03-16  
**Author:** Architecture Analysis

---

## 1. Context and Motivation

The current backend is a **Node.js/Express** server. The roadmap requires integration with **Java-based market connectivity APIs** (MTS market access, real-time pricing feeds, FIX protocol adapters). Node.js can technically call Java services, but operational complexity and performance overhead are significant. Migrating to **Micronaut (Java)** gives us:

- Native Java SDK compatibility for market APIs without an extra bridge layer
- JVM ecosystem: Netty, reactive streams, Disruptor for low-latency order flow
- GraalVM native compilation for fast startup and low memory footprint in containers
- Strong typing and compile-time validation of the entire API layer
- Better concurrency model for handling multiple real-time data streams

The migration strategy is **additive, not destructive**: both the Node.js backend and the Micronaut backend will coexist in Docker. The frontend detects which backend is available and connects accordingly. The Node.js backend remains the production baseline until the Java backend achieves full feature parity and passes all E2E tests.

### 1.1 Runtime Services and Ports (Current)

| Layer | Service | Container | Host URL | Container Port | Target Backend |
|------|---------|-----------|----------|----------------|----------------|
| Frontend | BondVision Digital (Node target) | `mts-stratos-bondvision-digital` | `http://localhost:3001` | `3001` | Node.js (`/api` proxy → `bondvision-backend:3000`) |
| Frontend | BondVision Digital (Java target) | `mts-stratos-bondvision-digital-java` | `http://localhost:3002` | `3002` | Java (`/api` proxy → `bondvision-backend-java:3001`) |
| Backend | Node.js API | `mts-stratos-backend` | `http://localhost:3000` | `3000` | N/A |
| Backend | Java API | `mts-stratos-backend-java` | `http://localhost:3003` | `3001` | N/A |
| Database | PostgreSQL | `mts-stratos-postgres` | `localhost:5432` | `5432` | Shared by both backends |
| Cache | Redis | `mts-stratos-redis` | `localhost:6379` | `6379` | Shared by both backends |

---

## 2. Current Architecture

### 2.1 Stack

| Component    | Technology                          | Docker Container                   | Port |
|--------------|-------------------------------------|------------------------------------|------|
| Frontend     | React 18 + Vite (Node target)      | `mts-stratos-bondvision-digital`   | 3001 |
| Frontend     | React 18 + Vite (Java target)      | `mts-stratos-bondvision-digital-java` | 3002 |
| Backend      | Node.js 20 + Express               | `mts-stratos-backend`              | 3000 |
| Backend      | Micronaut 4 + Java 21              | `mts-stratos-backend-java`         | 3003 (host) → 3001 (container) |
| Database     | PostgreSQL 15                       | `mts-stratos-postgres`             | 5432 |
| Cache        | Redis 7                             | `mts-stratos-redis`                | 6379 |
| DB Admin     | pgAdmin 4                           | `mts-stratos-pgadmin`              | 5050 |

### 2.2 API Contract (Complete Inventory)

All endpoints are prefixed with `/api`.

#### Authentication (`/api/auth`)

| Method | Path              | Auth Required | Description                                       |
|--------|-------------------|---------------|---------------------------------------------------|
| POST   | `/auth/login`     | No            | Login; returns JWT + user object                  |
| GET    | `/auth/me`        | JWT           | Returns current user if session is valid          |
| POST   | `/auth/heartbeat` | JWT           | Renews session timestamp; prevents stale timeout  |
| POST   | `/auth/logout`    | JWT (optional)| Clears session state in DB and Redis              |

#### Users (`/api/users`) — Admin only

| Method | Path          | Auth Required | Description                          |
|--------|---------------|---------------|--------------------------------------|
| GET    | `/users`      | JWT + Admin   | List all users                       |
| POST   | `/users`      | JWT + Admin   | Create a new user                    |
| PUT    | `/users/:id`  | JWT + Admin   | Update user (role, is_active, password) |
| DELETE | `/users/:id`  | JWT + Admin   | Hard-delete a user                   |

#### Preferences (`/api/preferences`)

| Method | Path                    | Auth Required | Description                                    |
|--------|-------------------------|---------------|------------------------------------------------|
| GET    | `/preferences`          | JWT (optional)| Get all preferences (returns defaults if unauth)|
| GET    | `/preferences/ui_settings` | JWT (optional)| Get UI settings object                       |
| PUT    | `/preferences/ui_settings` | JWT        | Upsert full UI settings object                 |

#### Bonds (`/api/bonds`)

| Method | Path                       | Auth Required | Description                              |
|--------|----------------------------|---------------|------------------------------------------|
| GET    | `/bonds/:bondId/rfq-data`  | No            | Get mock RFQ pricing data for a bond ISIN|
| POST   | `/bonds/rfq/submit`        | No            | Submit RFQ (currently mock/logging only) |

#### Workspaces (`/api/workspaces`)

| Method | Path                        | Auth Required | Description                          |
|--------|-----------------------------|---------------|--------------------------------------|
| GET    | `/workspaces`               | JWT           | List all workspaces for current user |
| POST   | `/workspaces`               | JWT           | Create a new workspace               |
| PUT    | `/workspaces/:id`           | JWT           | Partial update of a workspace        |
| PUT    | `/workspaces/:id/activate`  | JWT           | Set `last_active_at` timestamp       |
| DELETE | `/workspaces/:id`           | JWT           | Delete a workspace                   |

#### System

| Method | Path         | Auth Required | Description       |
|--------|--------------|---------------|-------------------|
| GET    | `/health`    | No            | Health check `{"status":"ok"}` |

### 2.3 Session Management Logic

This is the most complex piece of business logic and must be ported exactly:

- **JWT payload:** `{ id, username, role, sessionId }` — signed with `JWT_SECRET`, expires in 24h
- **Session idle timeout:** 300 seconds (configurable via `SESSION_IDLE_TIMEOUT_SECONDS`)
- **Concurrent login prevention:** The combination of `users.is_logged_in`, `users.active_session_id`, `users.active_session_at`, and Redis key `auth:online:{userId}` prevents two simultaneous sessions
- **Stale session detection:** If `active_session_at` is older than `SESSION_IDLE_TIMEOUT_SECONDS`, the session is considered stale and auto-cleared
- **Redis TTL:** `SESSION_ONLINE_TTL_SECONDS` = `SESSION_IDLE_TIMEOUT_SECONDS + 15` (default: 315s)
- **Heartbeat:** Every 30 seconds the frontend calls `POST /auth/heartbeat` to renew `active_session_at`
- **On `/auth/me` and `/auth/heartbeat`:** re-syncs Redis TTL if the cached session is valid

**State Machine (Login flow):**
```
Login request received
    │
    ├─ Redis has session AND DB is_logged_in = true
    │       ├─ Session NOT stale → 409 ALREADY_LOGGED_IN
    │       └─ Session stale → clear state, proceed
    │
    ├─ Redis empty AND DB is_logged_in = true  
    │       ├─ Session NOT stale → sync Redis, 409 ALREADY_LOGGED_IN
    │       └─ Session stale → clear state, proceed
    │
    ├─ Redis has session AND DB is_logged_in = false
    │       └─ Clear Redis stale key, proceed
    │
    └─ Normal path → generate sessionId UUID, update DB, write Redis, issue JWT
```

### 2.4 Database Schema

The complete schema lives in `db/init.sql` and migrations in `db/migrations/`.

Key tables:

**`users`** — UUID PK, `username` (unique), `email` (unique), `password_hash` (bcrypt), `role` (admin/trader/viewer), `is_active`, `created_by` (self-referential FK), `last_login`, `is_logged_in`, `active_session_id` (UUID), `active_session_at` (timestamptz)

**`user_preferences`** — `user_id` FK, `preference_key` varchar, `preference_value` JSONB, unique constraint on `(user_id, preference_key)`. Currently only key used: `ui_settings`.

**`user_workspaces`** — `user_id` FK, `name`, `mode` (legacy/blank), `slots` JSONB, `layout` JSONB, `hidden_slots` JSONB, `sort_order` int, `last_active_at`, timestamps.

**`user_sessions`** — Exists in schema but not used by current routes (legacy, reserved for token blacklisting).

**`audit_log`** — Exists in schema but not populated by current routes (reserved).

### 2.5 Frontend API Connectivity

Current runtime uses two frontend instances with explicit proxy targets:

- `http://localhost:3001` → `'/api'` proxied to `http://bondvision-backend:3000` (Node.js)
- `http://localhost:3002` → `'/api'` proxied to `http://bondvision-backend-java:3001` (Java)

`AuthContext.jsx` uses `VITE_BACKEND_URL=/api`, so browser API calls always stay on the same origin and are routed by each frontend container's Vite proxy.

In production builds, `AuthContext.jsx` can still compute base URL dynamically:

```js
const getAPIUrl = () => {
    if (host !== 'localhost' && host !== '127.0.0.1') {
        return 'http://bondvision-backend:3000/api';
    }
    return 'http://localhost:3000/api';
};
```

This fallback logic remains available, but Docker runtime now relies on explicit `VITE_BACKEND_TARGET` + `VITE_BACKEND_URL` environment variables.

---

## 3. Target Architecture

### 3.1 New Stack

| Component          | Technology                        | Docker Container                    | Port |
|--------------------|-----------------------------------|-------------------------------------|------|
| Frontend (Node)    | React 18 + Vite                  | `mts-stratos-bondvision-digital`    | 3001 |
| Frontend (Java)    | React 18 + Vite                  | `mts-stratos-bondvision-digital-java` | 3002 |
| Backend (Node.js)  | Node.js 20 + Express (**keep**)  | `mts-stratos-backend`               | 3000 |
| Backend (Java)     | Micronaut 4 + Java 21 + MTS SDK  | `mts-stratos-backend-java`          | 3003 (host) → 3001 (container) |
| Database           | PostgreSQL 15 (**shared**)       | `mts-stratos-postgres`              | 5432 |
| Cache              | Redis 7 (**shared**)             | `mts-stratos-redis`                 | 6379 |

### 3.2 Coexistence Strategy

Two Docker Compose profiles:

- **`profile: nodejs`** — starts `mts-stratos-backend` (Node.js, port 3000)
- **`profile: java`** — starts `mts-stratos-backend-java` (Micronaut, port 3001)

The frontend uses a **backend discovery mechanism**:
1. On startup, try `GET /api/health` against each known backend URL in priority order
2. Use the first responding backend and cache the base URL in a React context
3. Fall back gracefully if neither responds (show offline mode)

Alternatively, an **environment variable** (`VITE_BACKEND_URL`) can be set at build time or runtime to pin the backend, bypassing auto-discovery.

### 3.3 Micronaut Technology Choices

| Concern               | Library / Module                              |
|-----------------------|-----------------------------------------------|
| HTTP server           | Micronaut HTTP Server (Netty)                 |
| JWT Authentication    | `micronaut-security-jwt`                      |
| Password hashing      | `spring-security-crypto` (BCrypt) or `at.favre.lib:bcrypt` |
| PostgreSQL access     | Micronaut Data JDBC + HikariCP                |
| Redis                 | Micronaut Redis (Lettuce)                     |
| Input validation      | `micronaut-validation` (Jakarta Validation)   |
| Configuration         | `application.yml` + environment variables     |
| Build tool            | Gradle (Kotlin DSL)                           |
| Java version          | Java 21 (LTS)                                 |
| Container             | Eclipse Temurin 21 Alpine base image          |
| GraalVM native        | Optional future step (after parity achieved)  |

---

## 4. Migration Phases

### Phase 0 — Preparation (prerequisites, no code changes)

- [ ] Define the OpenAPI 3.1 spec for the full current API contract (derive from this document)
- [ ] Write integration test suite that validates every endpoint via HTTP (can reuse Playwright or write with REST-assured)
- [ ] Set up the Java project skeleton with Micronaut CLI or `mn create-app`
- [ ] Configure Gradle build with all required dependencies
- [ ] Create `Dockerfile` for the Java backend container

### Phase 1 — Infrastructure Plumbing

- [ ] Add `docker-compose.java-backend.yml` (Java backend service definition)
- [ ] Extend `docker-compose.master.yml` with profile support (nodejs / java / both)
- [ ] Modify `vite.config.js` Vite proxy to accept `VITE_BACKEND_PORT` env variable
- [ ] Modify `AuthContext.jsx` `getAPIUrl()` to support env-driven backend URL
- [ ] Add `VITE_BACKEND_URL` environment variable to both Docker Compose profiles

### Phase 2 — Java Backend: Core Foundation

- [ ] **DB Connection Pool** — `datasources.default` in `application.yml`, shared PostgreSQL instance
- [ ] **Redis Client** — Lettuce integration, shared Redis instance
- [ ] **Entity classes** — `User`, `UserPreference`, `UserWorkspace` (with JSONB handling)
  - JSONB fields: use `String` (raw JSON) + Jackson deserialization or `@TypeDef` with custom converter
- [ ] **JWT Configuration** — `micronaut-security-jwt`, same secret as Node.js (`JWT_SECRET`)
  - **Critical:** Use identical JWT signing algorithm (HS256) and claim structure `{id, username, role, sessionId}`
  - Tokens must be cross-compatible between the two backends if a user migrates mid-session
- [ ] **CORS Configuration** — mirror Node.js allowed origins (`http://localhost:3002`, `http://bondvision-digital:3002`)

### Phase 3 — Java Backend: Feature Implementation (in order)

#### 3.1 Health Endpoint
- `GET /api/health` → `{"status":"ok"}`

#### 3.2 Authentication Endpoints
- `POST /api/auth/login` — full session management logic (stale detection, concurrent login)
- `GET /api/auth/me` — JWT validation + session state check + Redis TTL refresh
- `POST /api/auth/heartbeat` — session renewal
- `POST /api/auth/logout` — DB + Redis cleanup

> **Warning:** The session logic is stateful across PostgreSQL AND Redis. The Java implementation must replicate the exact state machine described in §2.3 to be drop-in compatible.

#### 3.3 Preferences Endpoints
- `GET /api/preferences/ui_settings`
- `PUT /api/preferences/ui_settings`
- `GET /api/preferences` (wrapper)

> Note: Unauthenticated users get default preferences (no 401). This special-case must be preserved.

#### 3.4 Workspaces Endpoints
- Full CRUD: GET, POST, PUT, PUT/activate, DELETE

#### 3.5 Users Endpoints (Admin only)
- Full CRUD with role-based guard (`requireAdmin`)

#### 3.6 Bonds Endpoints — MTS SDK Integration
- `GET /api/bonds/:bondId/rfq-data` — Phase 3a: return same mock data as Node.js; Phase 3b: delegate to MTS SDK for live instrument data and dealer quotes
- `POST /api/bonds/rfq/submit` — Phase 3a: mock response; Phase 3b: route RFQ to MTS market via the proprietary MTS Java SDK
- `GET /api/bonds/instruments` (new) — expose MTS bond/instrument search backed by MTS SDK
- `GET /api/bonds/market-depth/:isin` (new) — live L2 market depth via MTS SDK streaming

> The MTS proprietary Java SDK is the primary motivation for this migration. It exposes the MTS bond market API (instrument lookup, dealer quote streaming, RFQ submission, trade execution). Node.js cannot use this SDK without an IPC bridge; Micronaut talks to it natively on the JVM.

### Phase 4 — Frontend Backend Discovery

Modify the frontend to support dynamic backend selection:

```jsx
// Priority order: env variable → Java backend → Node.js backend → fallback
const discoverBackendUrl = async () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    if (envUrl) return envUrl;

    const candidates = [
        'http://bondvision-backend-java:3001/api',
        'http://bondvision-backend:3000/api',
        'http://localhost:3001/api',
        'http://localhost:3000/api',
    ];

    for (const url of candidates) {
        try {
            const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(1000) });
            if (res.ok) return url;
        } catch { /* try next */ }
    }
    return candidates[candidates.length - 1]; // last resort
};
```

> This change must be backward compatible — if only the Node.js backend is running, the app behaves exactly as today.

### Phase 5 — Parity Validation

- [ ] Run full E2E test suite against Java backend (`API_BASE=http://bondvision-backend-java:3001/api`)
- [ ] Validate all session management edge cases (concurrent login, stale session, heartbeat)
- [ ] Performance comparison: response time p99, memory footprint, startup time
- [ ] Security review: JWT secret handling, bcrypt cost factor, CORS headers

### Phase 6 — Java Backend as Default (Cutover)

- [ ] Update `docker-compose.master.yml` to start Java backend by default
- [ ] Update `VITE_BACKEND_URL` default to point to Java backend
- [ ] Keep Node.js backend available via explicit profile for rollback
- [ ] Archive Node.js backend after 30-day stability period

---

## 5. Key Implementation Notes for Java/Micronaut

### 5.1 BCrypt Interoperability

The database stores passwords hashed with `bcryptjs` (Node.js) using the `$2a$` or `$2b$` prefix. The Java BCrypt library must be compatible with these hashes. Recommended: `at.favre.lib:bcrypt` which supports both variants.

```
bcryptjs (Node.js) → $2b$10$... compatible with Spring/Favre BCrypt
```

### 5.2 JWT Interoperability

If a user's JWT was issued by Node.js and they switch to the Java backend mid-session, the token must still validate. Both backends must use:
- Algorithm: **HMAC-SHA256 (HS256)**
- Secret: same `JWT_SECRET` environment variable
- Claims: `{ id: UUID, username: string, role: string, sessionId: UUID }`
- Expiry: 24h

In Micronaut Security, configure:
```yaml
micronaut:
  security:
    token:
      jwt:
        signatures:
          secret:
            generator:
              secret: ${JWT_SECRET}
```

### 5.3 JSONB Fields (PostgreSQL)

Fields `preference_value`, `slots`, `layout`, `hidden_slots` are stored as PostgreSQL JSONB. With Micronaut Data JDBC, map these as `String` and use Jackson for serialization/deserialization, or use a custom `TypeConverter<String, JsonNode>`.

### 5.4 UUID Primary Keys

All PKs are `uuid_generate_v4()` (PostgreSQL extension). In Java, use `java.util.UUID` for entity IDs and configure Micronaut Data to not auto-generate them (let PostgreSQL handle it):
```java
@GeneratedValue(GeneratedValue.Type.AUTO) // delegates to DB DEFAULT
```

### 5.5 Session State — Redis Key Format

Must match exactly:
```
auth:online:{userId}   → value: sessionId string, TTL: SESSION_ONLINE_TTL_SECONDS
```

### 5.6 Environment Variables

The Java backend must accept the same environment variable names for operational consistency:

| Variable                        | Used by Node.js | Required by Java |
|---------------------------------|-----------------|------------------|
| `DATABASE_URL`                  | ✅              | ✅ (parse JDBC URL from it) |
| `REDIS_URL`                     | ✅              | ✅             |
| `JWT_SECRET`                    | ✅              | ✅             |
| `SESSION_IDLE_TIMEOUT_SECONDS`  | ✅              | ✅             |
| `SESSION_ONLINE_TTL_SECONDS`    | ✅              | ✅             |
| `CORS_ORIGIN`                   | ✅              | ✅             |
| `PORT`                          | ✅ (3000)       | 3001 (different default) |

> `DATABASE_URL` format from Node.js is `postgresql://user:pass@host:5432/db`. Micronaut expects JDBC format: `jdbc:postgresql://host:5432/db`. The Java backend must parse or convert this at startup.

---

## 6. Folder Structure (proposed)

```
MTS-Stratos/
├── bondvision-backend/          ← Node.js (existing, unchanged)
├── bondvision-backend-java/     ← NEW: Micronaut project
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── Dockerfile
│   ├── src/main/java/com/mts/stratos/
│   │   ├── Application.java
│   │   ├── auth/
│   │   │   ├── AuthController.java
│   │   │   ├── AuthService.java
│   │   │   ├── SessionService.java
│   │   │   └── dto/
│   │   ├── users/
│   │   │   ├── UserController.java
│   │   │   ├── UserRepository.java
│   │   │   └── dto/
│   │   ├── preferences/
│   │   │   ├── PreferencesController.java
│   │   │   └── PreferencesRepository.java
│   │   ├── workspaces/
│   │   │   ├── WorkspacesController.java
│   │   │   └── WorkspacesRepository.java
│   │   ├── bonds/
│   │   │   ├── BondsController.java
│   │   │   ├── BondsService.java
│   │   │   └── mts/                ← MTS proprietary SDK integration
│   │   │       ├── MtsSdkClient.java       (Singleton SDK wrapper bean)
│   │   │       ├── MtsSdkConfig.java       (credentials from env vars)
│   │   │       ├── InstrumentService.java  (catalog queries)
│   │   │       ├── QuoteStreamService.java (real-time quotes → SSE)
│   │   │       └── RfqService.java         (RFQ submit + response stream)
│   │   └── health/
│   │       └── HealthController.java
│   └── src/main/resources/
│       ├── application.yml
│       └── application-docker.yml
├── bondvision-digital/           ← Frontend (modifications needed)
├── docker-compose.master.yml    ← Modified (profiles)
├── docker-compose.java-backend.yml  ← NEW
└── db/
    └── migrations/              ← Shared (no changes needed for migration)
```

---

## 7. Docker Compose Strategy

### New file: `docker-compose.java-backend.yml`
```yaml
services:
  bondvision-backend-java:
    build:
      context: ./bondvision-backend-java
      dockerfile: Dockerfile
    container_name: mts-stratos-backend-java
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://stratos:stratos2026@postgres:5432/stratos_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=stratos-secret-key-2026
      - SESSION_IDLE_TIMEOUT_SECONDS=300
      - SESSION_ONLINE_TTL_SECONDS=315
      - CORS_ORIGIN=http://bondvision-digital:3002
      - PORT=3001
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - mts-network
```

### Modified `vite.config.js`
```js
proxy: {
  '/api': {
    target: process.env.VITE_BACKEND_TARGET || 'http://bondvision-backend:3000',
    changeOrigin: true,
  }
}
```

---

## 8. Risks and Mitigations

| Risk                                         | Likelihood | Impact | Mitigation                                              |
|----------------------------------------------|------------|--------|---------------------------------------------------------|
| BCrypt hash incompatibility between libs     | Low        | High   | Test with existing hashes before go-live               |
| JWT cross-backend session invalidation       | Medium     | High   | Both backends share same `JWT_SECRET` and Redis        |
| JSONB deserialization edge cases             | Medium     | Medium | Use Jackson `ObjectNode` as catch-all type, test all preference permutations |
| Concurrent login race condition              | Low        | Medium | Identical PostgreSQL UPDATE logic; use DB-level locking if needed |
| `DATABASE_URL` format mismatch               | High       | High   | Write a startup utility to convert `postgresql://` to `jdbc:postgresql://` |
| Frontend discovery timeout causing slow startup | Low     | Low    | Use `AbortSignal.timeout(1000)` + short circuit on env var |

---

## 9. MTS SDK Integration Details

### 9.1 SDK Role

The **MTS proprietary Java SDK** is the primary reason for this migration. It provides:

- **Instrument catalog access** — query tradable bonds listed on MTS markets (IT, EU Govies, Covered Bonds, etc.)
- **Dealer quote streaming** — subscribe to real-time bid/ask quotes per ISIN from registered dealers
- **RFQ submission** — send Request For Quote to selected dealers through the MTS trading protocol
- **Trade execution feedback** — receive dealer responses and execution confirmations asynchronously
- **Market depth (L2)** — subscribe to aggregated book depth per instrument

### 9.2 SDK Integration Architecture

```
Frontend (React)
     │  REST/WebSocket
     ▼
Micronaut Backend (Java)
     │  MTS Java SDK (JVM-native)
     ▼
MTS Market Infrastructure
  ├── Instrument Service
  ├── Quote Feed
  ├── RFQ Gateway
  └── Trade Bus
```

The SDK likely uses **callbacks or reactive streams** for async market events. Micronaut's reactive pipeline (Project Reactor / RxJava) translates these to SSE or WebSocket streams for the frontend.

### 9.3 SDK-Driven New Endpoints (Phase 3b)

| Method    | Path                              | Description                                             |
|-----------|-----------------------------------|---------------------------------------------------------|
| GET       | `/api/bonds/instruments`          | Search MTS instrument catalog                           |
| GET       | `/api/bonds/:isin/rfq-data`       | Live dealer quotes via SDK (replaces mock)              |
| POST      | `/api/bonds/rfq/submit`           | Submit RFQ to MTS market via SDK                        |
| GET       | `/api/bonds/:isin/market-depth`   | Live L2 book depth (REST snapshot)                      |
| SSE/WS    | `/api/bonds/:isin/quotes/stream`  | Streaming real-time quotes (Server-Sent Events)         |
| SSE/WS    | `/api/rfq/:rfqId/responses/stream`| Stream dealer responses after RFQ submission            |

### 9.4 SDK Initialization

The MTS SDK will require connection credentials (typically provided by MTS as a client certificate or username/password for their market gateway). These must be provided as environment variables and **never committed to source control**:

```
MTS_SDK_ENDPOINT=<mts-gateway-host>
MTS_SDK_USERNAME=<client-id>
MTS_SDK_PASSWORD=<secret>
MTS_SDK_CLIENT_CERT_PATH=/run/secrets/mts-client.p12
MTS_SDK_CERT_PASSWORD=<cert-password>
```

The SDK client should be initialized as a **Singleton Micronaut bean** with `@Context` scope so the connection is established at startup.

### 9.5 Open Questions

1. **SDK artifact delivery** — Is the MTS SDK available as a Maven/Gradle artifact (private Nexus/Artifactory repo)? Or as a JAR to vendor locally? The `build.gradle.kts` must reference it correctly.
2. **SDK version and docs** — What version of the SDK is available? Does it come with Javadoc / integration guide?
3. **SDK async model** — Does it use callbacks, `CompletableFuture`, reactive streams, or blocking calls? This determines whether we need a reactor adapter layer.
4. **MTS environment** — Is there a UAT/sandbox environment available for development and E2E testing before hitting production?
5. **Do we need real-time streaming to frontend?** If the SDK delivers quotes as a push stream, the Java backend should expose SSE or WebSocket to the React frontend. Micronaut supports both natively — confirm which the frontend should consume.
6. **GraalVM native image?** Reduces container startup to <100ms but requires SDK compatibility audit. Defer to after full parity is achieved.
7. **BCrypt cost factor** — Current Node.js uses cost 10. Java must match exactly.

---

## 10. Immediate Next Steps (for approval)

1. ✅ This document approved
2. ✅ MTS SDK confirmed: **proprietary MTS Java SDK**
3. Obtain MTS SDK artifact (JAR / private Maven repo) + connection credentials for UAT environment
4. Generate OpenAPI 3.1 spec from this document (`openapi.yml`)
5. Create `bondvision-backend-java/` Micronaut project scaffold with MTS SDK dependency
6. Implement Phase 1 (Docker infrastructure)
7. Implement Phase 2 (Java foundation) + Phase 3.1 (health) as a first deliverable
8. Demo Java backend health endpoint running in Docker alongside Node.js backend
9. Implement Phase 3.2–3.5 (full Node.js parity)
10. Implement Phase 3.6a (mock bonds) → validate E2E parity → Phase 3.6b (live MTS SDK)

---

*This document will be updated as implementation progresses. All implementation decisions will be tracked here.*

# BondVision Backend — Java / Micronaut

Micronaut 4.6.x + Java 21 backend. 100% API-compatible with the Node.js backend
(`bondvision-backend`). Runs side-by-side with the Node.js backend; the frontend
discovers which one to use via the `VITE_BACKEND_URL` environment variable.

---

## Prerequisites

- **Java 21** (runtime + compilation)
- **Gradle 8.8** — [download](https://gradle.org/releases/) and extract to a
  local directory, e.g. `%USERPROFILE%\AppData\Local\gradle-8.8\`
- **Docker Desktop**

> **Note:** Docker containers in this corporate environment cannot reach the
> internet (FortiVPN intercepts only host traffic). All dependency downloads must
> happen on the host machine where the VPN routes properly.

---

## Build the fat JAR (host machine)

```powershell
# From the project root
$env:JAVA_HOME = "C:\Users\MALupo\AppData\Local\Java\jdk-21.0.9"
$gradle = "$env:USERPROFILE\AppData\Local\gradle-8.8\bin\gradle.bat"

cd bondvision-backend-java
& $gradle shadowJar --no-daemon
```

The output is `build/libs/bondvision-backend-java-1.0.0-all.jar` (~18 MB).

This step must be run **before** `docker build` or `docker-compose ... up --build`.

---

## Run alongside Node.js backend (Java as target)

```powershell
# Build the JAR first (see above), then:
docker-compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up --build -d
```

The frontend at `http://localhost:3002` will connect to the Java backend at
`http://localhost:3001`.

---

## Run with Node.js backend only (default)

```powershell
docker-compose -f docker-compose.master.yml up --build -d
```

The frontend at `http://localhost:3002` will connect to the Node.js backend at
`http://localhost:3000`.

---

## API surface (identical to Node.js backend)

| Method | Path                              | Auth required | Description                          |
|--------|-----------------------------------|---------------|--------------------------------------|
| GET    | `/api/health`                     | No            | Health check                         |
| POST   | `/api/auth/login`                 | No            | Login → JWT + session                |
| GET    | `/api/auth/me`                    | Yes           | Validate session, return user        |
| POST   | `/api/auth/heartbeat`             | Yes           | Keep session alive                   |
| POST   | `/api/auth/logout`                | Yes           | Destroy session                      |
| GET    | `/api/users`                      | Admin         | List all users                       |
| POST   | `/api/users`                      | Admin         | Create user                          |
| PUT    | `/api/users/:id`                  | Admin         | Update user                          |
| DELETE | `/api/users/:id`                  | Admin         | Delete user                          |
| GET    | `/api/preferences/ui_settings`    | Optional      | Get UI preferences (defaults if anon)|
| PUT    | `/api/preferences/ui_settings`    | Yes           | Save UI preferences                  |
| GET    | `/api/workspaces`                 | Yes           | List workspaces                      |
| POST   | `/api/workspaces`                 | Yes           | Create workspace                     |
| PUT    | `/api/workspaces/:id`             | Yes           | Update workspace                     |
| PUT    | `/api/workspaces/:id/activate`    | Yes           | Mark workspace as last-active        |
| DELETE | `/api/workspaces/:id`             | Yes           | Delete workspace                     |
| GET    | `/api/bonds/:bondId/rfq-data`     | Yes           | Bond RFQ data (mock — Phase 3.6a)    |
| POST   | `/api/bonds/rfq/submit`           | Yes           | Submit RFQ (mock — Phase 3.6a)       |

---

## Phase roadmap

| Phase   | Status     | Description                                           |
|---------|------------|-------------------------------------------------------|
| 3.1-3.5 | ✅ Done     | Full REST API — auth, users, preferences, workspaces  |
| 3.6a    | ✅ Done     | Mock bonds/RFQ endpoints (same response shape as live)|
| 3.6b    | ⬜ Pending  | SDP integration — live market data from MTS test env  |

### Phase 3.6b (SDP integration)

Requires the following JARs from Artifactory
(`https://artifactory.oad.exch.int/artifactory/mts-software-factory-maven-release-dev-local/`):
- `com.mtsmarkets:sdp-protocol:5.0.1`
- `com.mtsmarkets:sdp-client:5.0.1`

The `sdp-bvf-BV14.1_20260128.1.jar` market classes JAR is already in `libs/` and
is loaded dynamically at runtime via `URLClassLoader`.

---

## Environment variables

| Variable                     | Default                                   | Description                  |
|------------------------------|-------------------------------------------|------------------------------|
| `PORT`                       | `3001`                                    | Listen port                  |
| `DATASOURCES_DEFAULT_URL`    | `jdbc:postgresql://localhost:5432/stratos_db` | PostgreSQL JDBC URL      |
| `DATASOURCES_DEFAULT_USERNAME` | `stratos`                               | DB user                      |
| `DATASOURCES_DEFAULT_PASSWORD` | `stratos2026`                           | DB password                  |
| `REDIS_URL`                  | `redis://localhost:6379`                  | Redis connection URI          |
| `JWT_SECRET`                 | `stratos-secret-key-2026`                 | HS256 secret (same as Node.js)|
| `SESSION_IDLE_TIMEOUT_SECONDS` | `300`                                   | Idle session timeout (s)     |
| `SESSION_ONLINE_TTL_SECONDS` | `315`                                     | Redis session TTL (s)        |
| `CORS_ORIGIN`                | *(empty)*                                 | Extra allowed CORS origin    |
| `IPSP_HOST`                  | `212.107.69.163`                          | SDP Phase 3.6b               |
| `IPSP_PORT`                  | `443`                                     | SDP Phase 3.6b               |
| `IPSP_SSL`                   | `true`                                    | SDP Phase 3.6b               |
| `PLATFORM_ID`                | `6`                                       | BondVision platform ID       |
| `SDP_LOGON_SIGNATURE`        | `1296912470`                              | SDP logon param              |
| `SDP_LOGON_SW_REVISION`      | `180202001`                               | SDP logon param              |

# MTS-Stratos - BondVision Trading Platform

Fully containerized full-stack workspace for the MTS BondVision trading platform.

## Project Architecture

### Technology Stack
- **Frontend:** React 18 + Vite
- **Backend:** Node.js/Express
- **Database:** PostgreSQL
- **Cache:** Redis
- **Testing:** Playwright E2E
- **Admin:** pgAdmin

### Services

#### BondVision Digital - Frontend (port 3002)
MTS BondVision trading application with a modern interface.
- **URL:** http://localhost:3002
- **Technology:** React 18 + Vite
- **Documentation:** [bondvision-digital/README.md](bondvision-digital/README.md)

#### BondVision Backend - API (port 5000)
RESTful API server for the BondVision platform.
- **URL:** http://localhost:5000
- **Technology:** Express.js
- **Database:** PostgreSQL (Docker connection)

#### PostgreSQL (port 5432)
Relational database for the platform.
- **Database:** stratos_db
- **User:** stratos
- **Snapshots:** `Testing/db-snapshots/`

#### Redis (port 6379)
Caching and session service.

#### pgAdmin (port 5050)
PostgreSQL administration tool.
- **URL:** http://localhost:5050

## Workspace System

The platform supports multiple workspaces with per-user persistence on the DB.

### Features
- **Tab bar** in the top bar: shows all user workspaces
- **DB Persistence**: workspaces survive logout/login (`user_workspaces` table)
- **Creation**: Click `+` → automatically enters edit mode
- **Edit mode**: shows all empty slots, drag & drop panels, click `X` to remove a slot, click **Done** to finish (remaining empty slots are automatically hidden)
- **Rename**: double-click on the tab or ⋮ menu → Rename
- **Reorder**: drag & drop tabs
- **⋮ menu**: Rename, Edit layout (blank only), Duplicate, Delete
- **Workspace types**: `legacy` (fixed layout with Trading+MarketDepth) and `blank` (free 3×2 grid)

### Available panels (blank workspace)
| Key | Title | Content |
|-----|-------|---------|
| `trading` | TRADING | Bond table with top-tabs, country-tabs, Search Column |
| `depth` | MARKET DEPTH | Order book |
| `blotter` | BLOTTER | Trade blotter |
| `data` | DATA | Historical data |
| `alerts` | ALERTS | Configured alerts |

### DB Schema (`user_workspaces`)
```sql
id            UUID PRIMARY KEY
user_id       INTEGER REFERENCES users(id)
name          TEXT
mode          TEXT  -- 'legacy' | 'blank'
slots         JSONB -- 6-element array with panel key or null
layout        JSONB -- {tradingWidth, marketWidth, dataHeight, ...}
hidden_slots  JSONB -- array of hidden slot indices
sort_order    INTEGER
last_active_at TIMESTAMP
```

### Localization
All workspace strings are localized in `src/context/LanguageContext.jsx` under the `workspace.*` key (EN + IT).


## Project Structure

```
.
├── bondvision-digital/       # React Frontend (port 3002)
│   ├── src/
│   ├── scripts/              # E2E tests (Playwright)
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── bondvision-backend/       # Express Backend (port 5000)
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── db/                       # Database initialization
│   └── init.sql
├── Testing/                  # E2E test suite and automation
│   ├── run-e2e-full.ps1     # Test orchestrator (PowerShell)
│   ├── E2E_DB_SNAPSHOT_RUNBOOK.md  # Snapshot procedure
│   ├── TEST_CHECKLIST.md    # Test results checklist
│   ├── TEST_PLAN.md         # Test plan
│   ├── TEST_RESULTS.xlsx    # Excel report
│   └── db-snapshots/        # DB snapshots pre/post test
├── docker-compose.master.yml # Multi-service orchestration
└── DOCKER.md                # Docker documentation
```

## How to Start the Application

### With Docker Compose (recommended)

```bash
# Start all services
docker-compose -f docker-compose.master.yml up -d

# Stop all services
docker-compose -f docker-compose.master.yml down
```

### Services and ports

| Service | Port | URL |
|---------|------|-----|
| BondVision Frontend | 3002 | http://localhost:3002 |
| BondVision Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| pgAdmin | 5050 | http://localhost:5050 |

### BondVision Digital (port 3002)

```bash
cd bondvision-digital
npm install
npm run dev
```

See [bondvision-digital/README.md](bondvision-digital/README.md) for more details.

### BondVision Backend (port 5000)

```bash
cd bondvision-backend
npm install
npm start
```

## Platform Usage

### Platform Login
1. Navigate to http://localhost:3002
2. Default credentials:
   - **Admin:** username: `admin`, password: `admin123`
   - **Demo User:** username: `demo`, password: `demo123`
3. Access the trading dashboard

### Database Administration
1. Access http://localhost:5050
2. Connect to the PostgreSQL database
3. Manage tables and data

## Port Summary

| Application | Port | URL |
|-------------|------|-----|
| Hello App | 3000 | http://localhost:3000 |
| BondVision Mockup | 3001 | http://localhost:3001 |
| BondVision Digital | 3002 | http://localhost:3002 |

## E2E Testing - Operational Conventions

### Full test run with data protection

```powershell
# Standard run with automatic DB backup/restore
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1

# Recommended run: save post-test snapshot on FAIL (troubleshooting)
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepPostTestDbOnFailure

# Audit run: always keep pre + post snapshots
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepDbSnapshots

# Fast CI run (no backup/restore)
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -SkipDbBackupRestore
```

### Default behavior
- **Pre-test**: automatic DB snapshot (`Testing/db-snapshots/pre-e2e-<runId>.dump`)
- **Test suite**: TC01-TC41 on a reset environment
- **Post-test**: automatic restore of pre-test DB (preserves manual users/data)
- **Reports**: `Testing/test-report.html`, `test-results.csv`, `test-results.json`

### Troubleshooting with post-test snapshots
1. Use `-KeepPostTestDbOnFailure` during testing
2. On FAIL, the `post-e2e-<runId>.dump` in `Testing/db-snapshots/` is preserved
3. Restore snapshot to an isolated debug DB (`stratos_debug`) for investigation
4. L'ambiente principale è già tornato allo stato pre-test

**Runbook dettagliato**: `Testing/E2E_DB_SNAPSHOT_RUNBOOK.md`

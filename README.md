# MTS-Stratos - BondVision Trading Platform

Workspace full-stack containerizzato per la piattaforma di trading MTS BondVision.

## Architettura del Progetto

### Stack Tecnologico
- **Frontend:** React 18 + Vite
- **Backend:** Node.js/Express
- **Database:** PostgreSQL
- **Cache:** Redis
- **Testing:** Playwright E2E
- **Admin:** pgAdmin

### Servizi

#### BondVision Digital - Frontend (porta 3002)
Applicazione di trading MTS BondVision con interfaccia moderna.
- **URL:** http://localhost:3002
- **Tecnologia:** React 18 + Vite
- **Documentazione:** [bondvision-digital/README.md](bondvision-digital/README.md)

#### BondVision Backend - API (porta 5000)
Server API RESTful per la piattaforma BondVision.
- **URL:** http://localhost:5000
- **Tecnologia:** Express.js
- **Database:** PostgreSQL (connessione via Docker)

#### PostgreSQL (porta 5432)
Database relazionale per la piattaforma.
- **Database:** stratos_db
- **User:** stratos
- **Snapshots:** `Testing/db-snapshots/`

#### Redis (porta 6379)
Servizio di caching e sessioni.

#### pgAdmin (porta 5050)
Strumento di amministrazione PostgreSQL.
- **URL:** http://localhost:5050

## Struttura del Progetto

```
.
├── bondvision-digital/       # Frontend React (porta 3002)
│   ├── src/
│   ├── scripts/              # E2E tests (Playwright)
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── bondvision-backend/       # Backend Express (porta 5000)
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── db/                       # Database initialization
│   └── init.sql
├── Testing/                  # E2E test suite e automation
│   ├── run-e2e-full.ps1     # Orchestratore test (PowerShell)
│   ├── E2E_DB_SNAPSHOT_RUNBOOK.md  # Procedura snapshot
│   ├── TEST_CHECKLIST.md    # Test results checklist
│   ├── TEST_PLAN.md         # Test plan
│   ├── TEST_RESULTS.xlsx    # Excel report
│   └── db-snapshots/        # Database snapshots pre/post test
├── docker-compose.master.yml # Orchestrazione multi-servizio
└── DOCKER.md                # Documentazione Docker
```

## Come Avviare l'Applicazione

### Con Docker Compose (raccomandato)

```bash
# Avvia tutti i servizi
docker-compose -f docker-compose.master.yml up -d

# Arresta tutti i servizi
docker-compose -f docker-compose.master.yml down
```

### Servizi e porte

| Servizio | Porta | URL |
|----------|-------|-----|
| BondVision Frontend | 3002 | http://localhost:3002 |
| BondVision Backend | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| pgAdmin | 5050 | http://localhost:5050 |

### BondVision Digital (porta 3002)

```bash
cd bondvision-digital
npm install
npm run dev
```

Vedi [bondvision-digital/README.md](bondvision-digital/README.md) per maggiori dettagli.

### BondVision Backend (porta 5000)

```bash
cd bondvision-backend
npm install
npm start
```

## Utilizzo Piattaforma

### Login alla Piattaforma
1. Naviga su http://localhost:3002
2. Credenziali predefinite:
   - **Admin:** username: `admin`, password: `admin123`
   - **Demo User:** username: `demo`, password: `demo123`
3. Accedi alla dashboard di trading

### Amministrazione Database
1. Accedi a http://localhost:5050
2. Connettiti al database PostgreSQL
3. Gestisci tabelle e dati
2. Versione prototipo della piattaforma di trading MTS BondVision

## Riepilogo Porte

| Applicazione | Porta | URL |
|--------------|-------|-----|
| Hello App | 3000 | http://localhost:3000 |
| BondVision Mockup | 3001 | http://localhost:3001 |
| BondVision Digital | 3002 | http://localhost:3002 |

## Testing E2E - Convenzioni operative

### Esecuzione test completa con protezione dati

```powershell
# Run standard con backup/restore automatico DB
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1

# Run consigliato con snapshot post-test su FAIL (troubleshooting)
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepPostTestDbOnFailure

# Run audit con snapshot pre + post sempre persistenti
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepDbSnapshots

# Run CI veloce (niente backup/restore)
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -SkipDbBackupRestore
```

### Comportamento predefinito
- **Pre-test**: snapshot DB automatico (`Testing/db-snapshots/pre-e2e-<runId>.dump`)
- **Esecuzione suite**: test TC01-TC41 su ambiente resettato
- **Post-test**: restore automatico DB pre-test (preserva utenti/dati manuali)
- **Report**: `Testing/test-report.html`, `test-results.csv`, `test-results.json`

### Troubleshooting con snapshot post-test
1. Usa `-KeepPostTestDbOnFailure` in fase di test
2. In caso di FAIL, conserva `post-e2e-<runId>.dump` in `Testing/db-snapshots/`
3. Ripristina snapshot in DB debug isolato (`stratos_debug`) per indagine
4. L'ambiente principale è già tornato allo stato pre-test

**Runbook dettagliato**: `Testing/E2E_DB_SNAPSHOT_RUNBOOK.md`

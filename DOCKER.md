# Docker Images - MTS-Stratos Platform

Documentazione delle immagini Docker utilizzate nel progetto MTS-Stratos.

## 📊 Inventario Immagini

| Immagine | Tag | Dimensione | Stato | Uso |
|----------|-----|-----------|-------|-----|
| `mts-stratos-bondvision-digital` | latest | 711 MB | ✅ Attiva | Frontend |
| `mts-stratos-bondvision-backend` | latest | 1.62 GB | ✅ Attiva | API Backend |
| `postgres` | 15-alpine | 392 MB | ✅ Attiva | Database |
| `redis` | 7-alpine | 61.2 MB | ✅ Attiva | Cache |
| `dpage/pgadmin4` | latest | 826 MB | ✅ Attiva | DB Admin UI |

---

## 🔍 Dettagli Immagini Attive

### 1. **mts-stratos-bondvision-digital** (711 MB)
**A cosa serve:** Frontend React + Vite per applicazione BondVision

**Componenti:**
- React 18 con JSX
- Vite (dev server hot reload)
- Styling con CSS personalizzato
- Componenti UI: Header, BondTable, MarketDepth, Sidebar

**Porta:** `3002`

**Variabili di Ambiente:**
- `NODE_ENV=development`

**Volumi Montati:**
- `/app/src` → `./bondvision-digital/src`
- `/app/public` → `./bondvision-digital/public`
- `/app/index.html` → `./bondvision-digital/index.html`

**Dipendenze:**
- PostgreSQL (database)
- Redis (cache)

**Dockerfile:** `Dockerfile.dev` (development con hot reload)

---

### 2. **mts-stratos-bondvision-backend** (1.62 GB)
**A cosa serve:** API Backend Node.js per gestione dati e logica di business

**Componenti:**
- Node.js 18
- Express.js (framework web)
- Autenticazione JWT
- Routes per:
  - Bonds (strumenti finanziari)
  - Preferences (preferenze utente)
  - Market depth
  - User management

**Porta:** `3000`

**Variabili di Ambiente:**
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://stratos:stratos2026@postgres:5432/stratos_db`
- `REDIS_URL=redis://redis:6379`
- `JWT_SECRET=stratos-secret-key-2026`
- `CORS_ORIGIN=http://localhost:3002`

**Dipendenze:**
- PostgreSQL (database)
- Redis (sessioni/cache)

---

### 3. **postgres:15-alpine** (392 MB)
**A cosa serve:** Database relazionale PostgreSQL per persistenza dati

**Componenti:**
- PostgreSQL 15
- Alpine Linux (minimale, ~392 MB)

**Porta:** `5432`

**Credenziali Default:**
- User: `stratos`
- Password: `stratos2026`
- Database: `stratos_db`

**Volumi Montati:**
- `/var/lib/postgresql/data` → `postgres-data` (volume persistente)
- `/docker-entrypoint-initdb.d/init.sql` → `./db/init.sql` (script iniziale)

---

### 4. **redis:7-alpine** (61.2 MB)
**A cosa serve:** Cache in-memory per sessioni, cache queries, rate limiting

**Componenti:**
- Redis 7
- Alpine Linux (minimale)

**Porta:** `6379`

**Volumi Montati:**
- `/data` → `redis-data` (persistenza Redis)

**Uso nel progetto:**
- Sessioni utente
- Cache dati frequenti
- Pub/Sub per comunicazioni

---

### 5. **dpage/pgadmin4:latest** (826 MB)
**A cosa serve:** UI web per amministrare il database PostgreSQL

**Componenti:**
- pgAdmin 4 (web UI)
- Server web built-in

**Porta:** `5050` (accessi a http://localhost:5050)

**Credenziali Default:**
- Email: `admin@stratos.com`
- Password: `admin`

**Funzionalità:**
- Visualizzare/modificare dati
- Creare backup
- Query editor
- Eseguire SQL

---

## 🎭 Playwright - Testing E2E

### **Dockerfile.e2e** (Testing)
**Stato:** ✅ Disponibile per testing automatizzato

File: `bondvision-digital/Dockerfile.e2e`
- Base image: `mcr.microsoft.com/playwright:v1.58.2-jammy`
- Browser: Chromium (headless)
- Script: `scripts/e2e-preferences.mjs`

### 📝 Cosa testa
Lo script `e2e-preferences.mjs` testa:
1. **Login API** - Autentica con credenziali (admin/admin123)
2. **Impostazioni utente** - Setta preferenze UI tramite API
3. **Caricamento UI** - Accede a http://localhost:3002
4. **Login UI** - Effettua login nell'interfaccia
5. **Colonne tabella** - Verifica ordine colonne: ISIN → DESCRIPTION → CCY
6. **Icona ordinamento** - Verifica la presence dell'icona di sort sull'ISIN

### 🚀 Come eseguire i test

#### **Prerequisito:** Avvia i container principali
```bash
cd "c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos"
docker-compose -f docker-compose.master.yml up -d
```

Aspetta che siano pronti:
- Frontend: http://localhost:3002 (pronto)
- Backend: http://localhost:3000 (pronto)
- DB: PostgreSQL pronto

#### **Opzione 1: Eseguire test tramite docker-compose (raccomandato)**

```bash
cd "c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos"
docker-compose -f docker-compose.master.yml run --rm e2e
```

Questo:
- Avvia il servizio `e2e` dal docker-compose
- Collega automaticamente alla rete `mts-network`
- Accede ai servizi tramite DNS interno (bondvision-backend:3000, bondvision-digital:3001)
- Esegue lo script di test
- Rimuove il container al termine

#### **Opzione 2: Eseguire il test con Docker standalone**

```bash
cd "c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos\bondvision-digital"
docker build -f Dockerfile.e2e -t mts-e2e-test .
docker run --rm \
  -e API_BASE=http://host.docker.internal:3000/api \
  -e UI_BASE=http://host.docker.internal:3002 \
  mts-e2e-test
```

### 📊 Output test

**Successo:**
```
Request: POST http://localhost:3000/api/auth/login
Response: 200 http://localhost:3000/api/auth/login
HTTP status: 200
Loaded HTML: <html>...</html>
Headers: ISIN | DESCRIPTION | CCY | ...
Order OK: true
Sort Icon OK: true
```

**Fallimento:**
```
Order OK: false    # Colonne non nell'ordine corretto
Sort Icon OK: false # Icona di ordinamento non presente
```

### 🔧 Variabili di Ambiente per i test

| Variabile | Default | Uso |
|-----------|---------|-----|
| `API_BASE` | `http://host.docker.internal:3000/api` | URL API Backend |
| `UI_BASE` | `http://localhost:3002` | URL Frontend (http://host.docker.internal:3002 da Docker) |

### 📋 Dati test hardcoded

Nel file `scripts/e2e-preferences.mjs`:
- **Username:** `admin`
- **Password:** `admin123`
- **Tema:** `dark`
- **Lingua:** `en`
- **Colonne aspettate:** `isin`, `description`, `ccy`
- **Ordinamento:** ISIN ascending

### 🖼️ Output test completo

Il container E2E genererà un file `e2e-output.txt` con i dettagli dell'esecuzione.

---

## 🚀 Come Avviare

### Start tutto il sistema
```bash
cd c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos
docker-compose -f docker-compose.master.yml up -d --build
```

### Start solo un servizio
```bash
docker-compose -f docker-compose.master.yml up -d bondvision-digital
docker-compose -f docker-compose.master.yml up -d bondvision-backend
```

### Eseguire test E2E
```bash
docker-compose -f docker-compose.master.yml run --rm e2e
```

### Visualizzare logs
```bash
docker logs mts-stratos-bondvision-digital -f
docker logs mts-stratos-backend -f
docker logs mts-stratos-postgres -f
```

### Accesso SSH container
```bash
docker exec -it mts-stratos-bondvision-digital sh
docker exec -it mts-stratos-backend sh
docker exec -it mts-stratos-postgres psql -U stratos -d stratos_db
```

---

## 📡 Porte Esposte

| Servizio | Porta | Uso |
|----------|-------|-----|
| BondVision Digital (Frontend) | `3002` | http://localhost:3002 |
| BondVision Backend (API) | `3000` | http://localhost:3000 |
| PostgreSQL | `5432` | Database connections |
| Redis | `6379` | Cache/Session store |
| pgAdmin | `5050` | http://localhost:5050 |

---

## 🔒 Reti

### **mts-network** (bridge)
Tutti i servizi comunicano tramite questa rete Docker interna.

**DNS interno:**
- `bondvision-digital:3002`
- `bondvision-backend:3000`
- `postgres:5432`
- `redis:6379`
- `pgadmin:80`

---

## 💾 Volumi Persistenti

| Volume | Uso |
|--------|-----|
| `postgres-data` | Dati database PostgreSQL |
| `redis-data` | Dati cache Redis |
| `pgadmin-data` | Config e storia pgAdmin |

---

## 🧹 Manutenzione

### Pulire immagini non usate
```bash
docker image prune -a
```

### Pulire volumi non utilizzati
```bash
docker volume prune
```

### Pulire tutto (⚠️ ATTENZIONE)
```bash
docker system prune -a --volumes
```

### Rimuovere immagine duplicata
```bash
docker rmi bondvision-digital-bondvision-dev
```

---

## 📝 Ultimo Aggiornamento
- **Data:** 2026-02-20
- **Immagini:** 5 attive
- **Spazio utilizzato:** ~2.9 GB
- **Status:** ✅ Production-ready


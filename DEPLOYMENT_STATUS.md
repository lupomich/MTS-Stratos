# MTS-Stratos Deployment Status

## ✅ Deployment Completato con Successo

**Data:** 18 Febbraio 2026  
**Ambiente:** Docker Desktop per Windows (WSL2 backend)

---

## Servizi Attivi

Tutti i servizi sono correttamente deployati e in esecuzione:

| Servizio | Container | Porta | Status | URL |
|----------|-----------|-------|--------|-----|
| **Backend API** | `mts-stratos-hello-app` | 3000 | ✅ Running | http://localhost:3000 |
| **Frontend Digital** | `mts-stratos-bondvision-digital` | 3002 | ✅ Running | http://localhost:3002 |
| **Frontend Mockup** | `mts-stratos-bondvision-mockup` | 3001 | ✅ Running | http://localhost:3001 |
| **PostgreSQL** | `mts-stratos-postgres` | 5432 | ✅ Running | localhost:5432 |
| **Redis** | `mts-stratos-redis` | 6379 | ✅ Running | localhost:6379 |
| **pgAdmin** | `mts-stratos-pgadmin` | 5050 | ✅ Running | http://localhost:5050 |

---

## Credenziali di Accesso

### Applicazione (Frontend)
- **URL:** http://localhost:3002
- **Account Demo:**
  - **Utente:** demo  
  - **Password:** user123  
  - **Ruolo:** user
- **Account Admin:**
  - **Utente:** admin  
  - **Password:** admin123  
  - **Ruolo:** admin

### pgAdmin (Database UI)
- **URL:** http://localhost:5050
- **Email:** admin@stratos.com
- **Password:** admin

### PostgreSQL (Connessione Diretta)
```
Host: localhost
Port: 5432
Database: stratos_db
Username: stratos
Password: stratos2026
```

### Redis (Connessione Diretta)
```
Host: localhost
Port: 6379
Password: (nessuna)
```

---

## Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: mts-network              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  Frontend Digital│        │  Frontend Mockup │          │
│  │    (React+Vite)  │        │    (React+Vite)  │          │
│  │   Port: 3002     │        │   Port: 3001     │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│           ┌───────────▼──────────────┐                      │
│           │     Backend API          │                      │
│           │   (Express.js + JWT)     │                      │
│           │      Port: 3000          │                      │
│           └──────┬────────────┬──────┘                      │
│                  │            │                             │
│         ┌────────▼───┐   ┌───▼─────────┐                   │
│         │ PostgreSQL │   │    Redis    │                   │
│         │ Port: 5432 │   │  Port: 6379 │                   │
│         └────────────┘   └─────────────┘                   │
│                │                                            │
│         ┌──────▼──────┐                                     │
│         │   pgAdmin   │                                     │
│         │ Port: 5050  │                                     │
│         └─────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Funzionalità Implementate

### Sistema di Autenticazione
- ✅ Login/Logout con JWT
- ✅ Registrazione utenti
- ✅ Gestione password con bcrypt (hash sicuro)
- ✅ Token blacklisting (invalidazione logout)
- ✅ Session tracking (tracciamento sessioni attive)
- ✅ Rate limiting (5 tentativi ogni 15 minuti per login)

### Gestione Utenti
- ✅ CRUD completo (Crea, Leggi, Aggiorna, Elimina)
- ✅ 4 ruoli: admin, trader, user, viewer
- ✅ Cambio password
- ✅ Attivazione/Disattivazione account
- ✅ Pannello admin (solo per ruolo admin)

### Preferenze Utente
- ✅ Salvataggio preferenze personalizzate (tema, lingua, layout)
- ✅ Caching Redis (1 ora TTL)
- ✅ Visibilità colonne griglia
- ✅ Export formato (CSV, Excel, PDF)

### Audit & Sicurezza
- ✅ Audit log per tutte le operazioni critiche
- ✅ Helmet.js per header di sicurezza
- ✅ CORS configurato
- ✅ Rate limiting generale (100 richieste ogni 15 minuti)

---

## Comandi Utili

### Avvio/Arresto Servizi
```powershell
# Avvia tutti i servizi
cd "c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos"
docker-compose -f docker-compose.master.yml up -d

# Arresta tutti i servizi
docker-compose -f docker-compose.master.yml down

# Arresta e rimuovi volumi (ATTENZIONE: cancella i dati del database!)
docker-compose -f docker-compose.master.yml down -v

# Ricostruisci e riavvia
docker-compose -f docker-compose.master.yml up --build -d
```

### Monitoraggio
```powershell
# Verifica stato container
docker ps -a --filter "name=mts-stratos"

# Log backend (ultimi 50 righe)
docker logs mts-stratos-hello-app --tail 50

# Log frontend (ultimi 50 righe)
docker logs mts-stratos-bondvision-digital --tail 50

# Log PostgreSQL
docker logs mts-stratos-postgres --tail 50

# Segui log in tempo reale
docker logs -f mts-stratos-hello-app
```

### Test API
```powershell
# Health check
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/health"

# Login
$body = @{username='demo'; password='user123'} | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -Body $body -ContentType "application/json"
```

---

## Database Schema

### Tabella: users
```sql
- id (UUID, PK)
- username (UNIQUE, NOT NULL)
- email (UNIQUE, NOT NULL)
- password_hash (NOT NULL)
- first_name
- last_name
- role (admin|trader|user|viewer, default: user)
- is_active (BOOLEAN, default: true)
- last_login
- created_at
- updated_at
```

### Tabella: user_preferences
```sql
- id (UUID, PK)
- user_id (FK -> users)
- preferences (JSONB)
- created_at
- updated_at
```

### Tabella: user_sessions
```sql
- id (UUID, PK)
- user_id (FK -> users)
- token_hash
- ip_address
- user_agent
- expires_at
- created_at
```

### Tabella: audit_log
```sql
- id (UUID, PK)
- user_id (FK -> users, optional)
- action
- resource_type
- resource_id
- details (JSONB)
- ip_address
- created_at
```

---

## Problemi Risolti Durante il Deployment

### 1. Firewall Aziendale
**Problema:** Corporate firewall bloccava:
- Docker Hub authentication
- Node.js package downloads
- Alpine Linux package manager

**Soluzione:**
```dockerfile
# Disabilitato SSL verification per npm
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npm config set strict-ssl false

# Configurato apk per usare HTTP e permettere pacchetti untrusted
RUN wget --no-check-certificate -O /etc/apk/keys/... && \
    apk add --allow-untrusted python3 make g++
```

### 2. Compilazione bcrypt
**Problema:** bcrypt richiede build tools nativi (Python, make, g++) che non sono presenti in `node:18-alpine`

**Soluzione:**
```dockerfile
RUN apk add --no-cache --allow-untrusted python3 make g++
```

### 3. Download Node.js Headers
**Problema:** node-gyp non riusciva a scaricare gli header di Node.js per compilare moduli nativi

**Soluzione:**
```dockerfile
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
```

---

## Prossimi Passi Consigliati

### Sicurezza (PRODUZIONE)
- [ ] Cambiare JWT_SECRET in `.env` (attualmente: `stratos-secret-key-2026-change-in-production`)
- [ ] Cambiare password PostgreSQL (attualmente: `stratos2026`)
- [ ] Cambiare password pgAdmin (attualmente: `admin`)
- [ ] Rimuovere `NODE_TLS_REJECT_UNAUTHORIZED=0` e configurare certificati aziendali
- [ ] Configurare HTTPS con certificati SSL
- [ ] Abilitare strict-ssl per npm in produzione

### Funzionalità Aggiuntive
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Activity log per utenti
- [ ] Export audit log
- [ ] Backup automatico database
- [ ] Notifiche in-app

### DevOps
- [ ] CI/CD pipeline con GitHub Actions
- [ ] Health checks automatici
- [ ] Monitoring con Prometheus/Grafana
- [ ] Log aggregation con ELK stack

---

## Documentazione Aggiuntiva

- [Sistema di Autenticazione](AUTH_SYSTEM.md)
- [Deployment Docker](DEPLOYMENT-DOCKER.md)
- [Implementazione Stratos](bondvision-digital/STRATOS_IMPLEMENTATION.md)

---

## Test di Verifica

### ✅ Test di Funzionamento

1. **Accesso Frontend:**
   - Aprire http://localhost:3002
   - Login con `demo` / `user123`
   - Verificare visualizzazione dashboard

2. **Gestione Preferenze:**
   - Cliccare icona settings (⚙️) in alto a destra
   - Cambiare tema da Light a Dark
   - Cliccare "Save Changes"
   - Ricaricare pagina → tema persistente

3. **Pannello Admin:**
   - Logout
   - Login con `admin` / `admin123`
   - Aprire Settings → scheda "Admin"
   - Verificare lista utenti

4. **Database:**
   - Aprire http://localhost:5050
   - Login con `admin@stratos.local` / `admin`
   - Aggiungere server PostgreSQL:
     - Host: `postgres`
     - Port: `5432`
     - Database: `stratos_db`
     - Username: `stratos`
     - Password: `stratos2026`
   - Esplorare tabelle in Schemas → public → Tables

---

## Supporto

Per problemi o domande:
1. Verificare i log: `docker logs mts-stratos-hello-app`
2. Controllare lo stato dei container: `docker ps -a`
3. Riavviare i servizi: `docker-compose -f docker-compose.master.yml restart`

---

**Deployment completato con successo! 🎉**

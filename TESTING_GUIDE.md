# MTS-Stratos Testing Guide

Questa guida spiega come eseguire la suite di test E2E completa per MTS-Stratos BondVision.

## 📋 Documenti di Test

- **[TEST_CHECKLIST.md](TEST_CHECKLIST.md)** - Checklist dettagliata di tutti i test (formato Markdown)
- **[TEST_CHECKLIST.xlsx](TEST_CHECKLIST.xlsx)** - Checklist in formato Excel per stampa/tracking
- **[bondvision-digital/scripts/e2e-full-test.mjs](bondvision-digital/scripts/e2e-full-test.mjs)** - Script Playwright automatizzato

## 🚀 Come Eseguire i Test

### Opzione 1: Test Automatizzati (Raccomandato)

#### Step 1: Avvia i container principali
```bash
cd "c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos"
docker-compose -f docker-compose.master.yml up -d
```

Verifica che siano pronti (aspetta ~30 secondi):
```bash
docker logs mts-stratos-bondvision-digital --tail 1
# Output atteso: "VITE v6.4.1  ready in XXXms"

docker logs mts-stratos-backend --tail 1
# Output atteso: "Server running on port 3000"
```

#### Step 2: Esegui la suite di test completa
```bash
cd "c:\Users\MALupo\OneDrive - Euronext\Github\MTS-Stratos\bondvision-digital"
docker run --rm \
  -e API_BASE=http://host.docker.internal:3000/api \
  -e UI_BASE=http://host.docker.internal:3002 \
  -v "$(pwd)/test-report.html:/app/test-report.html" \
  $(docker build -f Dockerfile.e2e -q .) \
  node scripts/e2e-full-test.mjs
```

**OPPURE** (più semplice) se il container e2e è nel docker-compose:
```bash
docker-compose -f docker-compose.master.yml run --rm e2e-full node scripts/e2e-full-test.mjs
```

#### Step 3: Visualizza il report
Il test genera automaticamente `test-report.html` nella directory bondvision-digital.

Apri il report:
```bash
# Windows
start bondvision-digital\test-report.html

# Mac
open bondvision-digital/test-report.html

# Linux
firefox bondvision-digital/test-report.html
```

### Opzione 2: Test Manuali

Usa il file [TEST_CHECKLIST.xlsx](TEST_CHECKLIST.xlsx) per eseguire i test manualmente.

**Step 1:** Apri il file Excel  
**Step 2:** Stampa il file (File → Print)  
**Step 3:** Esegui i test secondo la checklist  
**Step 4:** Marca i checkbox ✓ o ✗  
**Step 5:** Scrivi note negli ultimi test falliti  

---

## 📊 Output Test

### Report HTML (Automatizzato)
Il report automatizzato contiene:
- ✅ Numero totale di test
- ✅ Test passati/falliti
- ✅ Success rate (%)
- ✅ Tempo totale di esecuzione
- ✅ Dettagli di ogni test con timestamp
- ✅ Errori e motivazioni dei fallimenti

### Checklist Excel (Manuale)
Usa per:
- ✅ Tracking manuale dei test
- ✅ Documentazione offline
- ✅ Firmatura e approvazione
- ✅ Storico test

---

## 🧪 Test Covered

### Gestione Utenti (32 test)
- **ADMIN User** (8 test): Create, Login, Logout, Disable, Try Login Disabled, Enable, Login After Enable, Delete
- **MEMBER User** (8 test): Same cycle as ADMIN
- **TRADER User** (8 test): Same cycle as ADMIN
- **AUTOEX User** (8 test): Same cycle as ADMIN

**Scopo:** Verificare che il ciclo di vita completo degli utenti funzioni correttamente.  
**Rollback:** Tutti gli utenti di test vengono eliminati al termine.

### Impostazioni Utente (6 test)
- Login per impostazioni
- Cache colonna (hide column)
- Applicare filtri singoli e multipli
- Logout e verifica persistenza
- Reset all columns
- Logout e verifica reset persistito

**Scopo:** Verificare che le preferenze UI siano salvate e ripristinate correttamente.  
**Rollback:** Colonne ripristinate a stato di default.

### Badges UI (6 test)
- TEST badge visibile
- Market status badge visibile
- Member status badge visibile
- Trader status badge visibile
- AutoEx status badge visibile
- Badges con altezza uniforme

**Scopo:** Verificare che tutti i badge siano univoci in dimensione e visibili.

### Database Integrity (2 test)
- Nessun utente di test rimane nel database
- Cache pulita (Redis)

**Scopo:** Assicurare che il DB torni a stato pulito dopo i test.

---

## ⏱️ Tempo Esecuzione Atteso

| Suite | Durata Attesa | Note |
|-------|--------------|------|
| Test Completi (Automatizzati) | 15-20 min | Incluso Playwright, browser, tutti i test |
| Test Manuali (Checklist) | 30-45 min | Esecuzione manuale, pause per osservazione |
| Solo Utenti CRUD | 10-12 min | Subset dei test |
| Solo UI Settings | 5-7 min | Subset dei test |

---

## 🔧 Prerequisiti

### Per Test Automatizzati
- Docker Desktop installato e running
- BondVision containers UP (`docker ps` dovrebbe mostrare 5 container)
- Node.js 18+ (in docker, automatico)
- Playwright (in docker, automatico)

### Per Test Manuali
- Browser moderno (Chrome, Firefox, Edge)
- Excel o Google Sheets per aprire XLSX
- Accesso a http://localhost:3002

---

## 🐛 Troubleshooting

### Test fallisce con "Cannot reach API"
```bash
# Verifica che backend sia running
docker logs mts-stratos-backend

# Verifica che frontend sia running
docker logs mts-stratos-bondvision-digital

# Riprovare
docker-compose -f docker-compose.master.yml restart
```

### Excel non si apre
- Scarica OpenOffice Calc (gratuito) se Excel non disponibile
- Converti a Google Sheets per editing online

### Test timeouts (pagina non carica)
- ✅ Aumenta timeout in e2e-full-test.mjs (linea: `waitForNavigation: { timeout: 10000 }`)
- ✅ Verifica che localhost:3002 sia raggiungibile manualmente
- ✅ Verifica applicazione non è in background (minimizzata)

### Report HTML non genera
- ✅ Verifica permessi di scrittura su bondvision-digital/
- ✅ Controllare console per errori
- ✅ Eseguire manualmente: `node scripts/e2e-full-test.mjs`

---

## 📝 Formato Report

Il report HTML include:

```
MTS-Stratos E2E Test Report
Generated: 2026-02-20 14:30:45

Test Summary
├─ Total Tests: 46
├─ Passed: 44 (95.7%)
├─ Failed: 2
├─ Duration: 428.45s

Detailed Results
├─ [1.1] Create user Admin - PASS
├─ [1.2] Login user Admin-test - PASS
├─ [1.3] Logout user Admin-test - FAIL
│         Error: "Logout button not found"
├─ ...
└─ [8.4] Browser crash recovery - PASS

Test Environment
├─ API Base: http://localhost:3000/api
├─ UI Base: http://localhost:3002
└─ Execution: 2026-02-20 14:22:30
```

---

## 🔄 CI/CD Integration

Per integrare nei CI/CD (GitHub Actions, GitLab CI, etc):

```bash
# Build test image
docker build -f bondvision-digital/Dockerfile.e2e -t mts-tests .

# Run tests
docker run --rm \
  -e API_BASE=http://backend:3000/api \
  -e UI_BASE=http://frontend:3002 \
  mts-tests \
  node scripts/e2e-full-test.mjs

# Check exit code
# 0 = all tests passed
# 1 = some tests failed
```

---

## 📞 Support

Per problemi o domande sul testing:
1. Controllare [TEST_CHECKLIST.md](TEST_CHECKLIST.md) per dettagli
2. Verificare logs Docker: `docker logs <container-name>`
3. Eseguire test singoli manualmente per debugging
4. Aprire issue su GitHub se bug confermato


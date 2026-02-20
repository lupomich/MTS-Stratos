# MTS-Stratos Testing Checklist

**Versione:** 1.0  
**Ultimo aggiornamento:** 2026-02-20  
**Scope:** End-to-End Testing - Applicazione BondVision

---

## 📋 Panoramica Test Suite

Questa checklist verifica tutte le funzionalità principali dell'applicazione:
- ✅ Gestione utenti (CRUD, profili, abilitazione/disabilitazione)
- ✅ Funzionalità UI (colonne, ordinamento, filtri)
- ✅ Persistenza impostazioni utente
- ✅ Collegamento e disconnessione
- ✅ Integrità dati database (rollback post-test)

**Prerequisito:** Applicazione deve essere in stato iniziale (admin presente, nessun utente di test)

---

## 🔐 SECTION 1: GESTIONE UTENTI - PROFILO ADMIN

### Test 1.1: Creazione utente Admin (tramite Admin Panel)
- [ ] Accedere come admin
- [ ] Navigare a Admin Panel
- [ ] Click "Add User"
- [ ] Compilare form: username=admin-test, password=admin123, profilo=ADMIN
- [ ] Submit e verifica success message
- [ ] Verificare utente in lista utenti
- **Expected:** Utente creato con profilo ADMIN

### Test 1.2: Login utente Admin-test
- [ ] Logout da admin corrente
- [ ] Login con admin-test/admin123
- [ ] Verificare dashboard visibile
- [ ] Verificare accesso admin panel
- **Expected:** Login riuscito, accesso alle funzioni admin

### Test 1.3: Logout utente Admin-test
- [ ] Click logout
- [ ] Verificare reindirizzamento a login
- [ ] Tentare accesso all'app senza login (verificare blocco)
- **Expected:** Sessione terminata

### Test 1.4: Disattivazione utente Admin-test
- [ ] Login come admin originale
- [ ] Navigare a Gestione Utenti
- [ ] Trovare admin-test
- [ ] Click disattiva/disable
- [ ] Verificare status = disabled
- **Expected:** Utente disabilitato

### Test 1.5: Tentato login utente disattivato (Admin-test)
- [ ] Logout
- [ ] Tentare login admin-test/admin123
- [ ] Verificare errore "User disabled" o simile
- **Expected:** Login fallisce con messaggio appropriato

### Test 1.6: Riattivazione utente Admin-test
- [ ] Login come admin
- [ ] Navigare a Gestione Utenti
- [ ] Trovare admin-test
- [ ] Click attiva/enable
- [ ] Verificare status = active
- **Expected:** Utente riattivato

### Test 1.7: Login post-riattivazione (Admin-test)
- [ ] Logout
- [ ] Login admin-test/admin123
- [ ] Verificare accesso riuscito
- **Expected:** Login funziona dopo riattivazione

### Test 1.8: Cancellazione utente Admin-test
- [ ] Login come admin originale
- [ ] Navigare a Gestione Utenti
- [ ] Trovare admin-test
- [ ] Click delete
- [ ] Confermare eliminazione
- [ ] Verificare utente rimosso dalla lista
- **Expected:** Utente cancellato dal sistema

---

## 💼 SECTION 2: GESTIONE UTENTI - PROFILO MEMBER

### Test 2.1: Creazione utente Member
- [ ] Login come admin
- [ ] Navigare a Admin Panel
- [ ] Click "Add User"
- [ ] Compilare form: username=member-test, password=member123, profilo=MEMBER
- [ ] Submit e verifica success
- **Expected:** Utente Member creato

### Test 2.2: Login utente Member
- [ ] Logout da admin
- [ ] Login member-test/member123
- [ ] Verificare dashboard (non visibile admin panel)
- **Expected:** Login riuscito, no admin access

### Test 2.3: Logout utente Member
- [ ] Click logout
- [ ] Verificare reindirizzamento a login
- **Expected:** Sessione terminata

### Test 2.4-2.8: Ciclo disable/enable/delete per Member
- [ ] [Ripetere stessi step di test 1.4-1.8]
- **Expected:** Stesso comportamento di Admin-test

---

## 🏪 SECTION 3: GESTIONE UTENTI - PROFILO TRADER

### Test 3.1: Creazione utente Trader
- [ ] Login come admin
- [ ] Navigare a Admin Panel
- [ ] Click "Add User"
- [ ] Compilare form: username=trader-test, password=trader123, profilo=TRADER
- [ ] Submit e verifica success
- **Expected:** Utente Trader creato

### Test 3.2: Login utente Trader
- [ ] Logout da admin
- [ ] Login trader-test/trader123
- [ ] Verificare dashboard appropriato al profilo
- **Expected:** Login riuscito

### Test 3.3-3.8: Ciclo disable/enable/delete per Trader
- [ ] [Ripetere stessi step di test 1.4-1.8]
- **Expected:** Stesso comportamento

---

## ⚙️ SECTION 4: GESTIONE UTENTI - PROFILO AUTOEX

### Test 4.1: Creazione utente AutoEx
- [ ] Login come admin
- [ ] Navigare a Admin Panel
- [ ] Click "Add User"
- [ ] Compilare form: username=autoex-test, password=autoex123, profilo=AUTOEX
- [ ] Submit e verifica success
- **Expected:** Utente AutoEx creato

### Test 4.2: Login utente AutoEx
- [ ] Logout da admin
- [ ] Login autoex-test/autoex123
- [ ] Verificare dashboard appropriato
- **Expected:** Login riuscito

### Test 4.3-4.8: Ciclo disable/enable/delete per AutoEx
- [ ] [Ripetere stessi step di test 1.4-1.8]
- **Expected:** Stesso comportamento

---

## 💾 SECTION 5: PERSISTENZA IMPOSTAZIONI UTENTE (BondTable)

### Test 5.1: Login e modifica colonne (Member-test)
- [ ] Login come member-test
- [ ] Accedere a BondTable (Government Bonds)
- [ ] Notare colonne iniziali
- [ ] Click su colonna, verificare opzione "hide"
- **Expected:** Colonne visibili

### Test 5.2: Movimento colonne (drag & drop)
- [ ] Selezionare una colonna (es: PRICE)
- [ ] Drag & drop in altra posizione
- [ ] Verificare nuova posizione
- **Expected:** Colonna spostata

### Test 5.3: Ordinamento tabella
- [ ] Click su header della colonna ISIN
- [ ] Verificare icona sort ascending
- [ ] Click ancora per descending
- [ ] Verificare icona cambiata
- **Expected:** Ordinamento funziona, icona aggiornata

### Test 5.4: Ricerca/Filtri singoli
- [ ] Click su filtro (se disponibile)
- [ ] Inserire criterio di ricerca (es: ISIN contiene "IT")
- [ ] Verificare tabella filtrata
- [ ] Cancellare filtro
- [ ] Verificare tabella ripristinata
- **Expected:** Filtri e reset funzionano

### Test 5.5: Filtri multipli
- [ ] Applicare 2-3 filtri contemporaneamente
- [ ] Verificare tabella filtrata con AND logic
- [ ] Modificare uno dei filtri
- [ ] Verificare tabella aggiornata
- **Expected:** Filtri multipli funzionano

### Test 5.6: Logout e verifica persistenza
- [ ] Con impostazioni modificate, click logout
- [ ] Login nuovamente come member-test
- [ ] Verificare ordine colonne uguale a logout
- [ ] Verificare ultimo ordinamento mantenuto
- **Expected:** Impostazioni persistono

### Test 5.7: Reset All Columns
- [ ] Click su "Reset all columns" (se disponibile)
- [ ] Confermare reset
- [ ] Verificare:
  - Tutte le colonne visibili
  - Colonne in ordine di default
  - Ordinamento reset
  - Filtri rimossi
- **Expected:** Stato iniziale ripristinato

### Test 5.8: Verifica persistenza post-reset
- [ ] Logout
- [ ] Login come member-test
- [ ] Verificare colonne ancora in stato reset
- **Expected:** Reset persistito

---

## 🔍 SECTION 6: FUNZIONALITÀ AGGIUNTIVE

### Test 6.1: Header Status Badges
- [ ] Login come admin
- [ ] Verificare badge TEST (se environment di test)
- [ ] Verificare badge Market Status (Market ON/OFF)
- [ ] Verificare badge Member (ON/OFF)
- [ ] Verificare badge Dealer/Trader (ON/OFF)
- [ ] Verificare badge AutoEx (ON/OFF)
- **Expected:** Tutti i badge visibili e dimensionati uniformemente

### Test 6.2: Responsive UI
- [ ] Ridimensionare finestra browser a larghezza mobile (~375px)
- [ ] Verificare sidebar collapsabile
- [ ] Verificare tabella scrollabile
- [ ] Verificare header responsive
- [ ] Ripristinare dimensione desktop
- **Expected:** Layout responsive funziona

### Test 6.3: Cambio lingua
- [ ] Login come admin
- [ ] Accedere a Preferences (se disponibile)
- [ ] Cambiar lingua da EN a IT (o altra disponibile)
- [ ] Verificare UI tradotta
- [ ] Logout e login
- [ ] Verificare lingua mantenuta
- **Expected:** Cambio lingua persiste

### Test 6.4: Tema scuro/chiaro
- [ ] Accedere a Preferences
- [ ] Cambiare tema
- [ ] Verificare CSS aggiornato
- [ ] Logout e login
- [ ] Verificare tema mantenuto
- **Expected:** Tema persiste

---

## 🔄 SECTION 7: DATA INTEGRITY

### Test 7.1: Verifica Database post-test
- [ ] Collegare a PostgreSQL (pgAdmin o CLI)
- [ ] Verificare che nessuno degli utenti di test esista
- [ ] Verificare che admin originale sia intatto
- [ ] Verificare tabella preferences non contiene dati di utenti eliminati
- **Expected:** Database in stato iniziale

### Test 7.2: Verifica no lingering data
- [ ] Controllare Redis cache (se usato per session)
- [ ] Verificare nessuna sessione di utenti eliminati
- [ ] Verificare no stale preferences
- **Expected:** Cache pulita

---

## 📊 SECTION 8: EDGE CASES

### Test 8.1: Login simultaneo stesso utente
- [ ] Login come admin in browser 1
- [ ] Login come admin in browser 2
- [ ] Verificare se entrambe le sessioni funzionano o se una invalida l'altra
- **Expected:** Comportamento definito (documentare quale)

### Test 8.2: Session timeout
- [ ] Login
- [ ] Attendere timeout sessione (se configurato)
- [ ] Tentare operazione
- [ ] Verificare reindirizzamento a login
- **Expected:** Session timeout gestito correttamente

### Test 8.3: Modifica password utente
- [ ] Login come member-test
- [ ] Accedere a Profilo
- [ ] Cambiare password
- [ ] Logout
- [ ] Tentare login con vecchia password (fallisce)
- [ ] Tentare login con nuova password (succede)
- **Expected:** Cambio password funziona

### Test 8.4: Recupero dati dopo crash browser
- [ ] Login
- [ ] Effettuare modifiche nell'UI (colonne, filtri)
- [ ] Forzare crash browser (F12 → close socket)
- [ ] Riaprire browser
- [ ] Navigare all'app
- [ ] Verificare impostazioni mantenute
- **Expected:** Stato UI recuperato

---

## ✅ FORM DI COMPLETAMENTO TEST

Alla fine della test suite, completare:

- [ ] Data test: ________________
- [ ] Ora inizio: ________________
- [ ] Ora fine: ________________
- [ ] Tempo totale esecuzione: ________________
- [ ] Numero test passati: ____ / 60+
- [ ] Numero test falliti: ____
- [ ] Numero test skipped: ____
- [ ] Blocker issues: ________________
- [ ] Critical issues: ________________
- [ ] Minor issues: ________________
- [ ] Tester: ________________
- [ ] Ambiente: [ ] Dev [ ] Staging [ ] Production
- [ ] Note: ________________

---

## 📈 Metriche Attese

| Metrica | Target |
|---------|--------|
| Test Passati | ≥ 95% |
| Tempo Esecuzione | < 30 min |
| Database Integrità | ✅ 100% |
| No Memory Leaks | ✅ Verificato with DevTools |


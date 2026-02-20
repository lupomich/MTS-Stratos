# MTS-Stratos Test Plan FINALE - GUI Focused

**Data**: 2026-02-20  
**Versione**: FINAL  
**Timeout**: 10 secondi per test  
**Focus**: GUI (con API secondarie)  
**Totale Test**: 41

---

## SECTION 1: GESTIONE UTENTI - GUI ADMIN PANEL (Tests 1-24)

### Tests 1-8: Profilo ADMIN

**T01: Login Admin (GUI)**
- Naviga a /login
- Compila username: admin, password: admin123
- Click submit
- Verifica redirect a dashboard
- **Expected**: Dashboard visibile, badge ADMIN

**T02: Apertura Admin Panel (GUI)**
- Click su "Admin Panel" in Sidebar
- Verifica modal/page si apre
- **Expected**: Lista utenti visibile

**T03: Creazione utente Admin (GUI)**
- Click "Add User" in Admin Panel
- Compila form: username=admin-test, email=admin-test@stratos.local, password=Admin123!, role=admin
- Click Submit
- **Expected**: Success message, utente in lista

**T04: Login nuovo Admin (GUI)**
- Logout da admin
- Login con admin-test / Admin123!
- **Expected**: Dashboard visibile, badge ADMIN, accesso a Admin Panel

**T05: Logout Admin-test (GUI)**
- Click logout
- Verifica redirect a /login
- **Expected**: Redirect a login, no dashboard access senza auth

**T06: Disattivazione Admin-test (GUI)**
- Login come admin originale
- Apri Admin Panel
- Trova admin-test nella lista
- Click "Disable" o toggle status
- **Expected**: Status = Disabled/Inactive

**T07: Tentato login utente disattivato (GUI)**
- Logout
- Tenta login admin-test / Admin123!
- **Expected**: Errore "User disabled" o "Account inactive", rimane su /login

**T08: Riattivazione Admin-test (GUI)**
- Login come admin
- Admin Panel → trova admin-test
- Click "Enable" o toggle status
- **Expected**: Status = Active/Enabled

**T09: Login post-riattivazione (GUI)**
- Logout
- Login admin-test / Admin123!
- **Expected**: Login riuscito, dashboard visibile

**T10: Cancellazione Admin-test (GUI)**
- Login come admin
- Admin Panel → admin-test → Delete
- Conferma cancellazione
- **Expected**: Utente rimosso dalla lista

**T11: Verifica cancellazione (API)**
- GET /api/users con token admin
- Verifica admin-test non presente
- **Expected**: Lista utenti non contiene admin-test

### Tests 12-16: Profilo TRADER

**T12: Creazione Trader (GUI)**
- Login admin → Admin Panel → Add User
- Form: username=trader-test, email=trader-test@stratos.local, password=Trader123!, role=trader
- Submit
- **Expected**: Success, trader-test in lista

**T13: Login Trader (GUI)**
- Logout → Login trader-test / Trader123!
- **Expected**: Dashboard, badge TRADER, NO Admin Panel in Sidebar

**T14: Logout Trader (GUI)**
- Click logout
- **Expected**: Redirect a /login

**T15: Disattivazione + Riattivazione Trader (GUI)**
- Login admin → Disable trader-test → Tenta login (FAIL) → Enable → Login (SUCCESS)
- **Expected**: Disable blocca login, Enable ripristina

**T16: Cancellazione Trader (GUI)**
- Login admin → Delete trader-test
- **Expected**: Trader-test rimosso

### Tests 17-21: Profilo VIEWER

**T17: Creazione Viewer (GUI)**
- Login admin → Add User → viewer-test / Viewer123! / role=viewer
- **Expected**: Success

**T18: Login Viewer (GUI)**
- Login viewer-test / Viewer123!
- **Expected**: Dashboard, badge VIEWER, NO Admin Panel

**T19: Logout Viewer (GUI)**
- Logout
- **Expected**: Redirect a /login

**T20: Disable/Enable Viewer (GUI)**
- Login admin → Disable viewer-test → Login FAIL → Enable → Login SUCCESS
- **Expected**: Come T15

**T21: Cancellazione Viewer (GUI)**
- Delete viewer-test
- **Expected**: Viewer-test rimosso

### Tests 22-24: Verifica Finale Utenti

**T22: Verifica DB pulito (API)**
- GET /api/users
- **Expected**: Solo utenti baseline presenti (`admin`, `demo`)

**T23: Verifica nessun utente di test (GUI)**
- Admin Panel → lista utenti
- **Expected**: Solo `admin` e `demo` visibili

**T24: Ricrea utenti per prossimi test (GUI)**
- Crea trader-final (trader) e viewer-final (viewer) per Section 2
- **Expected**: 2 nuovi utenti per test persistenza

---

## SECTION 2: PERSISTENZA SETTINGS GUI (Tests 25-37)

**Setup**: Login come trader-final, naviga a BondTable

### Tests 25-28: Colonne

**T25: Spostamento colonna (GUI)**
- Sposta colonna `CCY` dopo `MATURITY`
- **Expected**: Ordine colonne aggiornato e persistito in preferenze

**T26: Hide colonna (GUI)**
- Nascondi colonna `CCY`
- **Expected**: `CCY` non visibile in griglia

**T27: Show colonna (GUI)**
- Riporta visibile la colonna `CCY`
- **Expected**: `CCY` nuovamente visibile

**T28: Reset All Columns (GUI)**
- Menu colonna `ISIN` → azione `Reset All`
- **Expected**: ordine default (`DESCRIPTION`, `ISIN`, `CCY`), filtri/sort azzerati

### Tests 29-33: Ordinamento

**T29: Ordinamento singolo (GUI)**
- Menu colonna `ISIN` → `Sort Asc`
- **Expected**: `isin` in sort ascending

**T30: Reverse sort (GUI)**
- Menu colonna `ISIN` → `Sort Desc`
- **Expected**: `isin` in sort descending

**T31: Ordinamento altra colonna (GUI)**
- Menu colonna `MATURITY` → `Sort Asc`
- **Expected**: sort su `description`, sort precedente su `isin` rimosso

**T32: Logout e verifica country tab (GUI)**
- Seleziona country tab `DE`
- Logout → Re-login trader-final
- **Expected**: tab `DE` ancora selezionato (persistenza country)

**T33: Logout e verifica sort (GUI)**
- Logout → Re-login trader-final
- **Expected**: ultimo sort (`description asc`) mantenuto

### Tests 34-37: Filtri

**T34: Filtro singolo (GUI)**
- Applica filtro `isin = <valore prima riga>`
- **Expected**: 1 sola riga visibile

**T35: Filtro multiplo (GUI)**
- Mantieni filtro `isin` + aggiungi filtro `maturity = <valore prima riga>`
- **Expected**: 2 filtri attivi, almeno 1 riga risultante

**T36: Rimozione filtro (GUI)**
- Rimuovi filtro `isin`
- **Expected**: resta solo filtro `maturity`

**T37: Clear all filtri (GUI)**
- Menu colonna `MATURITY` → `Clear Filters`
- **Expected**: nessun filtro attivo, tabella completa

---

## SECTION 3: PERSISTENZA COMPLETA (Tests 38-41)

**T38: Modifica miste (GUI)**
- Login trader-final
- Sposta `CCY` in testa + nascondi `CCY` + sort `ISIN desc` + filtro `description contains <word>`
- **Expected**: Tutte modifiche applicate

**T39: Logout e reload (GUI)**
- Logout → Login trader-final
- **Expected**: hidden/sort/filtro del T38 ripristinati

**T40: Reset completo (GUI)**
- Click "Reset All Columns"
- **Expected**: Tutto ripristinato (colonne, sort, filtri)

**T41: Cleanup finale (GUI)**
- Login admin → Delete trader-final e viewer-final
- Verifica baseline utenti in DB
- **Expected**: Database in stato iniziale (`admin`, `demo`)

---

## EXECUTION & REPORTING

### Timeout
- **10 secondi** per ogni test
- Se timeout, test = FAIL con motivo "Timeout 10s"

### Report Structure
```
Test ID | Description | Type | Start Time | Duration (ms) | Status | Fail Reason
T01     | Login Admin | GUI  | 10:15:23   | 1234          | PASS   | -
T02     | Open AdminPanel | GUI | 10:15:25 | 567        | FAIL   | Button not found
```

### Output Files
1. **Testing/test-report.html** - Report visuale
2. **Testing/test-results.csv** - Dati grezzi
3. **Testing/TEST_RESULTS.xlsx** - Excel con 2 sheets:
   - Summary: Pass rate, durata totale, breakdown per sezione
   - Details: Tutti i 41 test con timestamp e motivi fail

### Success Criteria
- ✅ Tutti i test automatizzati PASS
- ✅ Tempo totale < 8 minuti
- ✅ Database = stato iniziale
- ✅ No memory leaks (check DevTools)


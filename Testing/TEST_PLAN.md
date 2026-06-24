# MTS-Stratos Test Plan FINALE - GUI Focused

**Data**: 2026-02-23
**Versione**: FINAL
**Timeout**: configurabile (default 30 secondi per test)
**Focus**: GUI (con API secondarie)
**Totale Test**: 47

<!-- RUN_SUMMARY_START -->
- **Data esecuzione**: 2026-06-23
- **Timeout per test**: 30 secondi (30000 ms)
- **Start Time**: 2026-06-23 18:07:13 CEST (UTC: 2026-06-23T16:07:13.413Z)
- **End Time**: 2026-06-23 18:10:01 CEST (UTC: 2026-06-23T16:10:01.216Z)
- **Suite eseguita**: T01-T46
- **Risultato**: 46 PASS, 0 FAIL
- **Pass rate**: 100.0%
- **Durata totale**: 167.8s
- **Report generati**:
   - Testing/test-report.html
   - Testing/test-results.csv
   - Testing/test-results.json
   - Testing/TEST_CHECKLIST.md
   - Testing/TEST_PLAN.md
   - Testing/TEST_RESULTS.xlsx

### Stato Run / Pass-Fail

| Campo | Valore |
|-------|--------|
| Status | RUN |
| Pass/Fail | PASS |
| Test eseguiti | 46/47 |
| Test PASS | 46 |
| Test FAIL | 0 |
<!-- RUN_SUMMARY_END -->

---

## SECTION 1: GESTIONE UTENTI - GUI ADMIN PANEL (Tests 1-24)

**Access path update (UI simplification)**: l'accesso al pannello Admin avviene
esclusivamente da `MENU → ADMIN` (overlay menu). Il pulsante Admin nella parte bassa della sidebar non è più previsto.

### Tests 1-11: Profilo ADMIN
**T01: Login Admin (GUI)**
- Login with admin credentials via UI
- Expected: redirect to main dashboard

**T02: Open Admin Panel**
- Navigation: `MENU → ADMIN`
- Expected: Admin panel overlay opens

**T03: Create Admin user**
- Create new user with ADMIN role via Admin Panel
- Expected: user appears in user list

**T04: Login nuovo Admin**
- Login with newly created admin user credentials
- Expected: successful login and dashboard access

**T05: Logout Admin-test**
- Logout from Admin-test account
- Expected: redirect to login page

**T06: Disable Admin-test**
- Disable the Admin-test user from Admin Panel
- Expected: user status changes to disabled

**T07: Login utente disabilitato**
- Attempt login with disabled Admin-test account
- Expected: login rejected with appropriate error

**T08: Riattivazione Admin-test**
- Re-enable the Admin-test user from Admin Panel
- Expected: user status changes back to active

**T09: Login post-riattivazione**
- Login with re-enabled Admin-test account
- Expected: successful login

**T10: Delete Admin-test**
- Delete the Admin-test user from Admin Panel
- Expected: user no longer appears in user list

**T11: Verify DB clean (API)**
- API call to verify no orphan test users remain
- Expected: clean DB state confirmed

### Tests 12-16: Profilo TRADER
**T12: Create Trader user**
- Create new user with TRADER role via Admin Panel
- Expected: user appears in user list

**T13: Login Trader**
- Login with Trader credentials
- Expected: successful login, limited permissions confirmed

**T14: Logout Trader**
- Logout from Trader account
- Expected: redirect to login page

**T15: Disable/Enable Trader cycle**
- Disable then re-enable Trader user
- Expected: user disabled, fails login, re-enabled, passes login

**T16: Delete Trader**
- Delete the Trader user from Admin Panel
- Expected: user no longer appears in user list

### Tests 17-21: Profilo VIEWER
**T17: Create Viewer user**
- Create new user with VIEWER role via Admin Panel
- Expected: user appears in user list

**T18: Login Viewer**
- Login with Viewer credentials
- Expected: successful login, view-only permissions confirmed

**T19: Logout Viewer**
- Logout from Viewer account
- Expected: redirect to login page

**T20: Disable/Enable Viewer cycle**
- Disable then re-enable Viewer user
- Expected: user disabled, fails login, re-enabled, passes login

**T21: Delete Viewer**
- Delete the Viewer user from Admin Panel
- Expected: user no longer appears in user list

### Tests 22-24: Cleanup Verification
**T22: Verify DB clean (API)**
- API call to verify no orphan test users remain
- Expected: clean DB state confirmed

**T23: Verify GUI clean**
- Check Admin Panel GUI shows no test users
- Expected: only permanent users visible

**T24: Create users for Section 2**
- Create all users needed for Section 2 tests (admin-test, trader-test, viewer-test)
- Expected: all 3 test users created and accessible

---

## SECTION 2: PERSISTENZA IMPOSTAZIONI - GUI (Tests 25-37)

### Tests 25-28: Column Management
**T25: Drag & Drop column**
- Drag a bond table column to a new position
- Expected: column order persisted across refresh

**T26: Hide column**
- Hide a visible column in the bond table
- Expected: column hidden and state persisted

**T27: Show column**
- Re-show a hidden column in the bond table
- Expected: column visible and state persisted

**T28: Reset All Columns**
- Use Reset All to restore default column layout
- Expected: columns reset to default order

### Tests 29-33: Sorting
**T29: Sort ascending**
- Click column header to sort ascending
- Expected: rows sorted ascending, persisted after refresh

**T30: Sort descending**
- Click column header twice to sort descending
- Expected: rows sorted descending, persisted after refresh

**T31: Sort different column**
- Sort by a different column
- Expected: sort applied to new column, persisted

**T32: Persist country tab after logout**
- Select a country tab, logout, login again
- Expected: same country tab selected after re-login

**T33: Persist sort after logout**
- Apply sort, logout, login again
- Expected: sort order preserved after re-login

### Tests 34-37: Filtering
**T34: Single filter**
- Apply a single column filter in bond table
- Expected: filtered results shown, persisted after refresh

**T35: Multiple filters**
- Apply filters on multiple columns simultaneously
- Expected: combined filter results shown

**T36: Remove one filter**
- Remove one of multiple active filters
- Expected: remaining filters still active, removed filter cleared

**T37: Clear all filters**
- Clear all active column filters at once
- Expected: all filters removed, full bond list shown

---

## SECTION 3: FULL PERSISTENCE & CLEANUP (Tests 38-41)

### Tests 38-40: Integration Tests
**T38: Mixed modifications**
- Apply combination of sort, filter, column changes simultaneously
- Expected: all modifications applied and persisted

**T39: Persist all after reload**
- Reload the page with all mixed modifications active
- Expected: all changes still present after page reload

**T40: Complete reset**
- Use Reset All to clear all modifications
- Expected: application returns to clean default state

**T41: [SKIPPED - intentionally absent from current suite]**
- This test slot is reserved for future use
- Status: NOT RUN (by design)

---

## SECTION 4: RFQ OUTRIGHT (Tests 42-47)

### Tests 42-47: RFQ Window Flow
**T42: Login trader for RFQ tests**
- Login with trader account to access RFQ functionality
- Expected: successful login with trader permissions

**T43: Double-click bond row opens RFQ window**
- Double-click a bond row in the main table
- Expected: RFQ Outright window opens inline or as popup

**T44: RFQ window displays pricing data**
- Verify RFQ window shows correct bond pricing information
- Expected: bid/ask prices, quantities displayed correctly

**T45: RFQ window draggable and closable**
- Verify RFQ popup can be dragged and closed
- Expected: popup draggable, X button closes it

**T46: Open RFQ from OPEN RFQ button**
- Click the OPEN RFQ button in the bond table row
- Expected: RFQ window opens for the selected bond

**T47: Final cleanup (RFQ section)**
- Log out trader, clean up any test state
- Expected: application returned to clean state

---

## Execution & Reporting

### Pre-conditions
- Docker containers running: `mts-stratos-bondvision-digital`, `mts-stratos-bondvision-backend`, `mts-stratos-db`
- Fresh DB state (run DB reset if needed)
- Frontend accessible at http://localhost:3002

### Run Command
```powershell
cd bondvision-digital
node scripts/e2e-final.mjs
cd ..
powershell -File Testing/update-test-reports.ps1
```

### Output Files
| File | Description |
|------|-------------|
| Testing/test-results.json | Raw results (input to report generator) |
| Testing/TEST_CHECKLIST.md | Per-test status table with CET timestamps |
| Testing/TEST_PLAN.md | This file (summary section auto-updated) |
| Testing/TEST_RESULTS.xlsx | Excel report for stakeholders |
| Testing/test-report.html | HTML report |
| Testing/test-results.csv | CSV export |

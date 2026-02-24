# MTS-Stratos Test Plan FINALE - GUI Focused

**Data**: 2026-02-23  
**Versione**: FINAL  
**Timeout**: 10 secondi per test  
**Focus**: GUI (con API secondarie)  
**Totale Test**: 41

## Ultimo Esito Esecuzione (2026-02-23)

- **Suite eseguita**: TC01-TC41
- **Risultato**: 41 PASS, 0 FAIL
- **Pass rate**: 100.0%
- **Durata totale**: 90,64s
- **Report generati**:
   - Testing/test-report.html
   - Testing/test-results.csv
   - Testing/test-results.json
   - Testing/TEST_RESULTS.xlsx

### Stato Run / Pass-Fail

| Campo | Valore |
|-------|--------|
| Status | RUN |
| Pass/Fail | PASS |
| Test eseguiti | 41/41 |
| Test PASS | 41 |
| Test FAIL | 0 |

---

## SECTION 1: GESTIONE UTENTI - GUI ADMIN PANEL (Tests 1-24)

**Access path update (UI simplification)**: l'accesso al pannello Admin avviene esclusivamente da `MENU → ADMIN` (overlay menu). Il pulsante Admin nella parte bassa della sidebar non è più previsto.

### Tests 1-11: Profilo ADMIN
**T01: Login Admin (GUI)**
- Duration: 5467 ms
- Status: PASS
**T02: Open Admin Panel**
- Navigation: `MENU → ADMIN`
- Duration: 430 ms
- Status: PASS
**T03: Create Admin user**
- Duration: 902 ms
- Status: PASS
**T04: Login nuovo Admin**
- Duration: 2707 ms
- Status: PASS
**T05: Logout Admin-test**
- Duration: 322 ms
- Status: PASS
**T06: Disable Admin-test**
- Duration: 2552 ms
- Status: PASS
**T07: Login utente disabilitato**
- Duration: 2411 ms
- Status: PASS
**T08: Riattivazione Admin-test**
- Duration: 2125 ms
- Status: PASS
**T09: Login post-riattivazione**
- Duration: 1882 ms
- Status: PASS
**T10: Delete Admin-test**
- Duration: 3501 ms
- Status: PASS
**T11: Verify DB clean (API)**
- Duration: 130 ms
- Status: PASS
### Tests 12-16: Profilo TRADER
**T12: Create Trader user**
- Duration: 424 ms
- Status: PASS
**T13: Login Trader**
- Duration: 1742 ms
- Status: PASS
**T14: Logout Trader**
- Duration: 241 ms
- Status: PASS
**T15: Disable/Enable Trader cycle**
- Duration: 9421 ms
- Status: PASS
**T16: Delete Trader**
- Duration: 3365 ms
- Status: PASS
### Tests 17-21: Profilo VIEWER
**T17: Create Viewer user**
- Duration: 458 ms
- Status: PASS
**T18: Login Viewer**
- Duration: 1654 ms
- Status: PASS
**T19: Logout Viewer**
- Duration: 296 ms
- Status: PASS
**T20: Disable/Enable Viewer cycle**
- Duration: 9159 ms
- Status: PASS
**T21: Delete Viewer**
- Duration: 3051 ms
- Status: PASS
### Tests 22-24: Cleanup Verification
**T22: Verify DB clean (API)**
- Duration: 116 ms
- Status: PASS
**T23: Verify GUI clean**
- Duration: 15 ms
- Status: PASS
**T24: Create users for Section 2**
- Duration: 927 ms
- Status: PASS
---

## SECTION 2: PERSISTENZA IMPOSTAZIONI - GUI (Tests 25-37)

### Tests 25-28: Column Management
**T25: Drag & Drop column**
- Duration: 610 ms
- Status: PASS
**T26: Hide column**
- Duration: 540 ms
- Status: PASS
**T27: Show column**
- Duration: 531 ms
- Status: PASS
**T28: Reset All Columns**
- Duration: 1380 ms
- Status: PASS
### Tests 29-33: Sorting
**T29: Sort ascending**
- Duration: 575 ms
- Status: PASS
**T30: Sort descending**
- Duration: 551 ms
- Status: PASS
**T31: Sort different column**
- Duration: 571 ms
- Status: PASS
**T32: Persist country tab after logout**
- Duration: 3225 ms
- Status: PASS
**T33: Persist sort after logout**
- Duration: 4173 ms
- Status: PASS
### Tests 34-37: Filtering
**T34: Single filter**
- Duration: 451 ms
- Status: PASS
**T35: Multiple filters**
- Duration: 436 ms
- Status: PASS
**T36: Remove one filter**
- Duration: 450 ms
- Status: PASS
**T37: Clear all filters**
- Duration: 545 ms
- Status: PASS
---

## SECTION 3: FULL PERSISTENCE & CLEANUP (Tests 38-41)

### Tests 38-41: Integration Tests
**T38: Mixed modifications**
- Duration: 1995 ms
- Status: PASS
**T39: Persist all after reload**
- Duration: 6229 ms
- Status: PASS
**T40: Complete reset**
- Duration: 2660 ms
- Status: PASS
**T41: Final cleanup**
- Duration: 4690 ms
- Status: PASS

# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-26  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 2109 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 704 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1679 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2446 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 294 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2675 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2768 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2628 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1829 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 2903 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 91 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 1697 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 2352 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 311 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 10400 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3263 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1742 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2532 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 341 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 10281 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3032 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 86 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 15 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3410 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 573 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 546 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 536 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1738 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 861 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 800 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 816 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 2643 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3422 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 451 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 441 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 444 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 821 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4788 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5488 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2012 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 372 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2389 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1377 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4691 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1521 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 185 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-26 15:37:59 CET (UTC: 2026-02-26T14:37:59.458Z)
- **End Time**: 2026-02-26 15:39:41 CET (UTC: 2026-02-26T14:39:41.680Z)
- **Total Duration**: 102.22s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2222 ms
- **Slowest Test**: T15 (10400 ms)
- **Fastest Test**: T23 (15 ms)
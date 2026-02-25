# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-25  
**Timeout per test**: 10 secondi  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 3762 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 840 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1712 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 3296 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 348 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 3005 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2824 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2970 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1956 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 3399 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 104 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 1732 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 2666 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 369 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 10579 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3391 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1711 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2481 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 301 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 10825 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3341 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 93 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 11 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3426 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 587 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 552 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 535 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1696 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 884 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 826 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 905 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 2778 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3512 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 440 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 434 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 448 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 805 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4887 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5425 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2033 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 391 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2373 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1381 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 5082 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1972 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 646 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-25 13:03:21 CET (UTC: 2026-02-25T12:03:21.657Z)
- **End Time**: 2026-02-25 13:05:13 CET (UTC: 2026-02-25T12:05:13.721Z)
- **Total Duration**: 112.06s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2436 ms
- **Slowest Test**: T20 (10825 ms)
- **Fastest Test**: T23 (11 ms)
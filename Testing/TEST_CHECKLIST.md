# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-27  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 2055 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 682 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1695 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2679 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 362 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 3027 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2904 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2989 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2090 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 3690 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 82 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 1758 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 2729 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 360 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 10648 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3345 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1714 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2707 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 351 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 10764 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3472 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 82 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 17 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3539 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 589 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 552 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 536 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1688 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 842 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 846 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 835 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 5646 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 2927 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 456 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 447 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 452 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 845 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4392 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5376 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2040 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 333 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2471 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1366 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4726 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1582 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 178 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-27 12:34:06 CET (UTC: 2026-02-27T11:34:06.091Z)
- **End Time**: 2026-02-27 12:35:53 CET (UTC: 2026-02-27T11:35:53.073Z)
- **Total Duration**: 106.98s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2326 ms
- **Slowest Test**: T20 (10764 ms)
- **Fastest Test**: T23 (17 ms)
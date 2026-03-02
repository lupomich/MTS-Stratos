# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-03-02  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 6865 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 989 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1770 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 4349 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 369 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 4011 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2923 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 4000 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2877 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 4682 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 726 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 5097 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3625 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 335 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 13918 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 4738 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1715 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 3861 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 365 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 13949 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 4388 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 811 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 3196 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3612 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 590 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 558 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 554 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1741 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 1010 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 944 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 1062 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 6251 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3877 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 461 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 443 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 450 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 1009 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5613 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 6292 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2078 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 335 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2384 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1368 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4706 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1718 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 625 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-03-02 14:33:06 CET (UTC: 2026-03-02T13:33:06.854Z)
- **End Time**: 2026-03-02 14:35:36 CET (UTC: 2026-03-02T13:35:36.737Z)
- **Total Duration**: 149.88s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 3258 ms
- **Slowest Test**: T20 (13949 ms)
- **Fastest Test**: T42 (335 ms)
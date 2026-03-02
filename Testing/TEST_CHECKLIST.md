# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-03-02  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 7284 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 1190 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1928 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 4715 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 386 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 4210 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2802 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 3727 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2708 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 4256 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 823 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 4864 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3703 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 349 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 12947 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 4157 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1722 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 3453 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 305 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 13260 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 4389 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 739 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 2832 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3433 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 577 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 535 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 533 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1672 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 890 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 933 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 837 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 6363 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3802 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 468 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 454 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 467 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 825 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5271 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 6076 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2100 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 328 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2370 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1350 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4559 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1579 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 744 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-03-02 16:10:55 CET (UTC: 2026-03-02T15:10:55.212Z)
- **End Time**: 2026-03-02 16:13:15 CET (UTC: 2026-03-02T15:13:15.693Z)
- **Total Duration**: 140.48s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 3054 ms
- **Slowest Test**: T20 (13260 ms)
- **Fastest Test**: T19 (305 ms)
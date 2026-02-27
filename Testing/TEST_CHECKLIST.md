# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-27  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 3699 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 812 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1707 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 3363 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 325 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 3336 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2777 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 3373 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2515 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 3681 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 667 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 4240 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3232 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 307 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 12311 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3638 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1689 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 3118 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 293 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 11911 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3653 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 670 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 2432 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3375 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 562 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 542 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 534 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1625 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 846 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 831 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 800 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 6136 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3487 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 447 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 427 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 433 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 782 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4802 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5907 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1977 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 329 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2359 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1356 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4531 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1580 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 492 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-27 19:08:58 CET (UTC: 2026-02-27T18:08:58.103Z)
- **End Time**: 2026-02-27 19:11:01 CET (UTC: 2026-02-27T18:11:01.267Z)
- **Total Duration**: 123.16s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2677 ms
- **Slowest Test**: T15 (12311 ms)
- **Fastest Test**: T19 (293 ms)
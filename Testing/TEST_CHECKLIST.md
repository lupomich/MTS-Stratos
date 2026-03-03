# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-03-03  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 5382 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 734 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1736 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 3903 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 321 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 3696 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2772 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 4230 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2648 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 4113 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 16168 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 15137 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3793 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 333 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 12711 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 4206 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1718 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 3473 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 306 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 12875 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 4012 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 16038 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 13713 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3386 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 570 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 531 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 540 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1682 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 898 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 866 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 829 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 6476 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3865 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 450 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 426 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 446 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 839 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5272 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 6177 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2038 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 379 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2379 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1363 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4616 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1644 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 605 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-03-03 16:47:54 CET (UTC: 2026-03-03T15:47:54.944Z)
- **End Time**: 2026-03-03 16:51:18 CET (UTC: 2026-03-03T15:51:18.023Z)
- **Total Duration**: 203.08s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 4415 ms
- **Slowest Test**: T11 (16168 ms)
- **Fastest Test**: T19 (306 ms)
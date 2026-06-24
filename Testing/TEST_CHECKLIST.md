# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-06-23  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 5623 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 843 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1917 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 4889 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 338 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 4805 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2984 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 4858 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 3477 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 5585 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 840 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 5770 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 4583 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 349 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 15930 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 5450 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1834 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 4461 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 336 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 16869 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 6226 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 902 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 4881 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3739 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 650 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 608 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 577 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1283 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 1417 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 1483 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 1356 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 7332 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 5106 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 492 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 466 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 484 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 1255 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 6263 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 6804 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1785 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 4086 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2382 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1407 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4922 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1687 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 780 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-06-23 18:07:13 CEST (UTC: 2026-06-23T16:07:13.413Z)
- **End Time**: 2026-06-23 18:10:01 CEST (UTC: 2026-06-23T16:10:01.216Z)
- **Total Duration**: 167.8s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 3648 ms
- **Slowest Test**: T20 (16869 ms)
- **Fastest Test**: T19 (336 ms)
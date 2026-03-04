# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-03-04  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 2339 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 688 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1747 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 3152 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 393 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 3794 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2818 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 3802 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2871 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 4249 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 701 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 4597 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3487 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 325 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 13032 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 4220 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1744 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 3458 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 358 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 12870 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 4198 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 706 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 2932 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3413 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 585 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 535 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 545 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1707 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 984 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 1004 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 901 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 6379 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3918 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 464 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 450 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 446 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 894 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5441 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 6127 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2066 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 355 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2383 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1371 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4736 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1608 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 502 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-03-04 15:53:15 CET (UTC: 2026-03-04T14:53:15.812Z)
- **End Time**: 2026-03-04 15:55:31 CET (UTC: 2026-03-04T14:55:31.804Z)
- **Total Duration**: 135.99s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2956 ms
- **Slowest Test**: T15 (13032 ms)
- **Fastest Test**: T14 (325 ms)
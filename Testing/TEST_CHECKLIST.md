# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-27  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 2595 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 712 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1732 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2468 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 312 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2602 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2772 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2591 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1765 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 2882 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 88 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 1668 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 2353 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 295 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 9646 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 2869 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1670 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2396 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 296 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 9685 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 2867 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 84 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 13 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3344 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 544 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 539 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 535 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1604 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 773 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 784 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 751 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 5203 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 2662 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 436 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 433 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 443 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 787 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4000 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5170 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1895 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 328 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2380 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1366 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4526 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1523 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 183 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-27 15:14:13 CET (UTC: 2026-02-27T14:14:13.792Z)
- **End Time**: 2026-02-27 15:15:53 CET (UTC: 2026-02-27T14:15:53.547Z)
- **Total Duration**: 99.76s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2169 ms
- **Slowest Test**: T20 (9685 ms)
- **Fastest Test**: T23 (13 ms)
# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-26  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 2949 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 926 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1803 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2936 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 350 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2771 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2838 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2946 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1972 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 3328 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 113 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 1732 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 2644 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 332 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 10262 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3064 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1694 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2548 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 313 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 10231 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3228 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 95 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 15 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3407 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 570 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 529 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 528 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1705 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 786 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 767 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 749 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 2586 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3462 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 453 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 431 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 446 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 753 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4571 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5356 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1978 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 328 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2381 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1379 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4663 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1588 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 228 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-26 15:48:13 CET (UTC: 2026-02-26T14:48:13.134Z)
- **End Time**: 2026-02-26 15:49:59 CET (UTC: 2026-02-26T14:49:59.095Z)
- **Total Duration**: 105.96s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2304 ms
- **Slowest Test**: T15 (10262 ms)
- **Fastest Test**: T23 (15 ms)
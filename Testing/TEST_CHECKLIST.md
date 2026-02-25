# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-25  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 3748 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 1014 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1833 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 3024 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 354 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2923 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2949 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 3055 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2978 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 4703 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 323 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 2373 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3931 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 395 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 12084 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3746 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1728 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2565 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 353 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 10936 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3733 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 128 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 19 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3548 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 587 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 541 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 543 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1737 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 888 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 877 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 780 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 3127 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3896 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 468 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 454 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 461 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 939 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5438 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5971 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2192 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 337 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2390 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1393 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4617 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1764 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 497 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-25 16:08:09 CET (UTC: 2026-02-25T15:08:09.920Z)
- **End Time**: 2026-02-25 16:10:13 CET (UTC: 2026-02-25T15:10:13.500Z)
- **Total Duration**: 123.58s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2687 ms
- **Slowest Test**: T15 (12084 ms)
- **Fastest Test**: T23 (19 ms)
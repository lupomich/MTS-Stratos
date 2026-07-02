# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-07-01  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 3880 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 906 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1746 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 3627 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 290 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 3819 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2794 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 3855 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 2591 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 4090 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 706 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 4646 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 3404 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 323 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 12908 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 4022 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1676 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 3530 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 301 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 13342 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 4347 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 693 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 3120 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3348 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 559 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 547 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 538 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1155 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 1130 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 1165 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 1148 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 6309 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3821 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 454 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 434 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 436 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 1074 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5441 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5978 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1547 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 4472 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2060 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1061 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 2769 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 2024 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 472 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-07-01 18:02:18 CEST (UTC: 2026-07-01T16:02:18.095Z)
- **End Time**: 2026-07-01 18:04:37 CEST (UTC: 2026-07-01T16:04:37.322Z)
- **Total Duration**: 139.23s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 3027 ms
- **Slowest Test**: T20 (13342 ms)
- **Fastest Test**: T05 (290 ms)
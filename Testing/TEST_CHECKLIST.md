# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-27  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 46  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 2107 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 881 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 1753 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2463 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 304 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2929 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2755 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2675 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1809 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 3117 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 91 ms | - |
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 1675 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 2373 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 296 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 9890 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 2972 ms | - |
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 1710 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 2346 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 292 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 9891 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 2992 ms | - |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 85 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 13 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3347 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 555 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 535 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 534 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1604 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 863 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 816 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 799 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 5372 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 2656 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 442 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 431 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 457 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 765 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 4161 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 5216 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1998 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 338 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2367 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1369 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4501 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1576 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 188 ms | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-27 17:08:42 CET (UTC: 2026-02-27T16:08:42.265Z)
- **End Time**: 2026-02-27 17:10:26 CET (UTC: 2026-02-27T16:10:26.751Z)
- **Total Duration**: 104.49s
- **Total Tests**: 46
- **Passed**: 46
- **Failed**: 0
- **Pass Rate**: 100.0%
- **Average Test Duration**: 2271 ms
- **Slowest Test**: T20 (9891 ms)
- **Fastest Test**: T23 (13 ms)
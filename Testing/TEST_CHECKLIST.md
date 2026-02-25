# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-25  
**Timeout per test**: 30 secondi (30000 ms)  
**Totale test**: 27  
**Focus**: GUI con API secondarie

---

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | FAIL | 10348 ms | User viewer-test not found in table |
| T21 | Delete Viewer | GUI | âœ… RUN | FAIL | 30013 ms | Timeout 30s |
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 102 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 12 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 3451 ms | - |
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 564 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 537 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 539 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1685 ms | - |
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 810 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 831 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 843 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 2866 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 3436 ms | - |
| T34 | Single filter | GUI | âœ… RUN | PASS | 450 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 448 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 445 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 826 ms | - |
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 5476 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | FAIL | 17776 ms | Persist: grid state unavailable after relogin |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 1973 ms | - |
| T42 | Login admin for RFQ tests | GUI | âœ… RUN | PASS | 333 ms | - |
| T43 | Double-click bond row opens RFQ window | GUI | âœ… RUN | PASS | 2370 ms | - |
| T44 | RFQ window displays pricing data | GUI | âœ… RUN | PASS | 1364 ms | - |
| T45 | RFQ window draggable and closable | GUI | âœ… RUN | PASS | 4576 ms | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | âœ… RUN | PASS | 1718 ms | - |
| T47 | Final cleanup | GUI | âœ… RUN | PASS | 328 ms | - |
| T01 | - | GUI | NOT RUN | - | - | - |
| T02 | - | GUI | NOT RUN | - | - | - |
| T03 | - | GUI | NOT RUN | - | - | - |
| T04 | - | GUI | NOT RUN | - | - | - |
| T05 | - | GUI | NOT RUN | - | - | - |
| T06 | - | GUI | NOT RUN | - | - | - |
| T07 | - | GUI | NOT RUN | - | - | - |
| T08 | - | GUI | NOT RUN | - | - | - |
| T09 | - | GUI | NOT RUN | - | - | - |
| T10 | - | GUI | NOT RUN | - | - | - |
| T11 | - | GUI | NOT RUN | - | - | - |
| T12 | - | GUI | NOT RUN | - | - | - |
| T13 | - | GUI | NOT RUN | - | - | - |
| T14 | - | GUI | NOT RUN | - | - | - |
| T15 | - | GUI | NOT RUN | - | - | - |
| T16 | - | GUI | NOT RUN | - | - | - |
| T17 | - | GUI | NOT RUN | - | - | - |
| T18 | - | GUI | NOT RUN | - | - | - |
| T19 | - | GUI | NOT RUN | - | - | - |
| T41 | - | GUI | NOT RUN | - | - | - |

## SUMMARY

- **Start Time**: 2026-02-25 15:32:45 CET (UTC: 2026-02-25T14:32:45.020Z)
- **End Time**: 2026-02-25 15:34:25 CET (UTC: 2026-02-25T14:34:25.779Z)
- **Total Duration**: 100.76s
- **Total Tests**: 27
- **Passed**: 24
- **Failed**: 3
- **Pass Rate**: 88.9%
- **Average Test Duration**: 3732 ms
- **Slowest Test**: T21 (30013 ms)
- **Fastest Test**: T23 (12 ms)
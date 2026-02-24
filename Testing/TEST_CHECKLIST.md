# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-23  
**Timeout per test**: 10 secondi  
**Totale test**: 47  
**Focus**: GUI con API secondarie

---

## SECTION 1: USER MANAGEMENT - Admin Panel (24 tests)

**Access path update**: Admin panel access is only through `MENU → ADMIN` in the overlay menu. The old Admin shortcut in the left sidebar footer has been removed.

### Subsection A: Admin Profile (11 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 5467 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 430 ms | MENU → ADMIN |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 902 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2707 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 322 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2552 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2411 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 2125 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1882 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 3501 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 130 ms | - |
### Subsection B: Trader Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 424 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 1742 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 241 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 9421 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 3365 ms | - |
### Subsection C: Viewer Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T17 | Create Viewer user | GUI | âœ… RUN | PASS | 458 ms | - |
| T18 | Login Viewer | GUI | âœ… RUN | PASS | 1654 ms | - |
| T19 | Logout Viewer | GUI | âœ… RUN | PASS | 296 ms | - |
| T20 | Disable/Enable Viewer cycle | GUI | âœ… RUN | PASS | 9159 ms | - |
| T21 | Delete Viewer | GUI | âœ… RUN | PASS | 3051 ms | - |
### Subsection D: Cleanup Verification (3 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T22 | Verify DB clean (API) | API | âœ… RUN | PASS | 116 ms | - |
| T23 | Verify GUI clean | GUI | âœ… RUN | PASS | 15 ms | - |
| T24 | Create users for Section 2 | GUI | âœ… RUN | PASS | 927 ms | - |
---

## SECTION 2: SETTINGS PERSISTENCE - GUI (13 tests)

### Subsection E: Column Management (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T25 | Drag & Drop column | GUI | âœ… RUN | PASS | 610 ms | - |
| T26 | Hide column | GUI | âœ… RUN | PASS | 540 ms | - |
| T27 | Show column | GUI | âœ… RUN | PASS | 531 ms | - |
| T28 | Reset All Columns | GUI | âœ… RUN | PASS | 1380 ms | - |
### Subsection F: Sorting (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T29 | Sort ascending | GUI | âœ… RUN | PASS | 575 ms | - |
| T30 | Sort descending | GUI | âœ… RUN | PASS | 551 ms | - |
| T31 | Sort different column | GUI | âœ… RUN | PASS | 571 ms | - |
| T32 | Persist country tab after logout | GUI | âœ… RUN | PASS | 3225 ms | - |
| T33 | Persist sort after logout | GUI | âœ… RUN | PASS | 4173 ms | - |
### Subsection G: Filtering (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T34 | Single filter | GUI | âœ… RUN | PASS | 451 ms | - |
| T35 | Multiple filters | GUI | âœ… RUN | PASS | 436 ms | - |
| T36 | Remove one filter | GUI | âœ… RUN | PASS | 450 ms | - |
| T37 | Clear all filters | GUI | âœ… RUN | PASS | 545 ms | - |
---

## SECTION 3: FULL PERSISTENCE & CLEANUP (4 tests)

### Subsection H: Integration Tests (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T38 | Mixed modifications | GUI | âœ… RUN | PASS | 1995 ms | - |
| T39 | Persist all after reload | GUI | âœ… RUN | PASS | 6229 ms | - |
| T40 | Complete reset | GUI | âœ… RUN | PASS | 2660 ms | - |
| T41 | Final cleanup | GUI | âœ… RUN | PASS | 4690 ms | - |
## SECTION 4: RFQ OUTRIGHT - Window (6 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T42 | Login trader for RFQ tests | GUI | NOT RUN | - | - | - |
| T43 | Double-click bond row opens RFQ window | GUI | NOT RUN | - | - | - |
| T44 | RFQ window displays pricing data | GUI | NOT RUN | - | - | - |
| T45 | RFQ window draggable and closable | GUI | NOT RUN | - | - | - |
| T46 | Open RFQ from OPEN RFQ button | GUI | NOT RUN | - | - | - |
| T47 | Final cleanup (RFQ section) | GUI | NOT RUN | - | - | - |
## SUMMARY

### Section Scores

| Section | Total Tests | Passed | Failed | Not Run | Pass Rate |
|---------|------------|--------|--------|---------|-----------|
| Section 1: User Management | 24 | 24 | 0 | 0 | 100% |
| Section 2: Settings Persistence | 13 | 13 | 0 | 0 | 100% |
| Section 3: Integration | 4 | 4 | 0 | 0 | 100% |
| Section 4: RFQ Outright | 6 | 0 | 0 | 6 | 0% |
| **TOTAL** | **47** | 41 | 0 | 6 | 87.2% |

### Execution Details

- **Start Time**: 2026-02-23T13:56:29.314Z
- **End Time**: 2026-02-23T13:57:59.953Z
- **Total Duration**: 90.64s
- **Average Test Duration**: 2211 ms
- **Slowest Test**: T15 (8734 ms)
- **Fastest Test**: T23 (30 ms)

### Failure Analysis

Nessun fallimento rilevato nell'ultima esecuzione.

### Validation Checklist

- [ ] All 47 tests executed
- [ ] Pass rate = 100.0%
- [x] Database restored to initial state (admin + demo)
- [x] No JavaScript console errors
- [x] Report files generated
- [x] Total execution time < 8 minutes

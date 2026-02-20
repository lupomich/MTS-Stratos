# MTS-Stratos Test Checklist FINALE

**Data creazione**: 2026-02-20  
**Timeout per test**: 10 secondi  
**Totale test**: 40  
**Focus**: GUI con API secondarie

---

## SECTION 1: USER MANAGEMENT - Admin Panel (24 tests)

### Subsection A: Admin Profile (11 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T01 | Login Admin (GUI) | GUI | ⬜ Not Run | - | - | Username: admin, Password: admin123 |
| T02 | Open Admin Panel | GUI | ⬜ Not Run | - | - | Sidebar → Admin Panel button |
| T03 | Create Admin user | GUI | ⬜ Not Run | - | - | admin-test/Admin123!/admin |
| T04 | Login nuovo Admin | GUI | ⬜ Not Run | - | - | admin-test credentials |
| T05 | Logout Admin-test | GUI | ⬜ Not Run | - | - | Verify redirect to /login |
| T06 | Disable Admin-test | GUI | ⬜ Not Run | - | - | Status → Disabled |
| T07 | Login utente disabilitato | GUI | ⬜ Not Run | - | - | Expect error message |
| T08 | Riattivazione Admin-test | GUI | ⬜ Not Run | - | - | Status → Enabled |
| T09 | Login post-riattivazione | GUI | ⬜ Not Run | - | - | Should succeed |
| T10 | Cancellazione Admin-test | GUI | ⬜ Not Run | - | - | Delete button |
| T11 | Verifica cancellazione in DB | API | ⬜ Not Run | - | - | GET /api/users |

### Subsection B: Trader Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T12 | Create Trader user | GUI | ⬜ Not Run | - | - | trader-test/Trader123!/trader |
| T13 | Login Trader | GUI | ⬜ Not Run | - | - | No Admin Panel visible |
| T14 | Logout Trader | GUI | ⬜ Not Run | - | - | Redirect to login |
| T15 | Disable/Enable cycle | GUI | ⬜ Not Run | - | - | Disable → Login FAIL → Enable → Login OK |
| T16 | Delete Trader | GUI | ⬜ Not Run | - | - | Remove from DB |

### Subsection C: Viewer Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T17 | Create Viewer user | GUI | ⬜ Not Run | - | - | viewer-test/Viewer123!/viewer |
| T18 | Login Viewer | GUI | ⬜ Not Run | - | - | No Admin Panel visible |
| T19 | Logout Viewer | GUI | ⬜ Not Run | - | - | Redirect to login |
| T20 | Disable/Enable cycle | GUI | ⬜ Not Run | - | - | Same as T15 |
| T21 | Delete Viewer | GUI | ⬜ Not Run | - | - | Remove from DB |

### Subsection D: Cleanup Verification (3 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T22 | Verify DB clean | API | ⬜ Not Run | - | - | Baseline users only: admin + demo |
| T23 | Verify GUI clean | GUI | ⬜ Not Run | - | - | Admin Panel shows admin + demo only |
| T24 | Create users for Section 2 | GUI | ⬜ Not Run | - | - | trader-final & viewer-final |

---

## SECTION 2: SETTINGS PERSISTENCE - GUI (12 tests)

### Subsection E: Column Management (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T25 | Move column order | GUI | ⬜ Not Run | - | - | Move CCY after MATURITY |
| T26 | Hide column | GUI | ⬜ Not Run | - | - | Hide CCY column |
| T27 | Show column | GUI | ⬜ Not Run | - | - | Show CCY back |
| T28 | Reset All Columns | GUI | ⬜ Not Run | - | - | Menu action resetAll on ISIN |

### Subsection F: Sorting (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T29 | Sort ascending | GUI | ⬜ Not Run | - | - | Menu action sortAsc on ISIN |
| T30 | Sort descending | GUI | ⬜ Not Run | - | - | Menu action sortDesc on ISIN |
| T31 | Sort different column | GUI | ⬜ Not Run | - | - | Sort MATURITY asc, ISIN sort removed |
| T32 | Persist sort after logout | GUI | ⬜ Not Run | - | - | Expect MATURITY asc persisted |

### Subsection G: Filtering (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T33 | Single filter | GUI | ⬜ Not Run | - | - | ISIN equals first-row ISIN |
| T34 | Multiple filters | GUI | ⬜ Not Run | - | - | ISIN + MATURITY equals first row |
| T35 | Remove one filter | GUI | ⬜ Not Run | - | - | Remove ISIN, keep MATURITY |
| T36 | Clear all filters | GUI | ⬜ Not Run | - | - | Menu action clearFilters |

---

## SECTION 3: FULL PERSISTENCE & CLEANUP (4 tests)

### Subsection H: Integration Tests (4 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|-----------------|------|--------|-----------|----------|-------|
| T37 | Mixed modifications | GUI | ⬜ Not Run | - | - | Move CCY + hide CCY + ISIN desc + description filter |
| T38 | Persist all after reload | GUI | ⬜ Not Run | - | - | Verify T37 state after relogin |
| T39 | Complete reset | GUI | ⬜ Not Run | - | - | resetAll + verify default state |
| T40 | Final cleanup | GUI | ⬜ Not Run | - | - | Delete trader-final & viewer-final |

---

## SUMMARY

### Section Scores

| Section | Total Tests | Passed | Failed | Not Run | Pass Rate |
|---------|------------|--------|--------|---------|-----------|
| Section 1: User Management | 24 | 0 | 0 | 24 | 0% |
| Section 2: Settings Persistence | 12 | 0 | 0 | 12 | 0% |
| Section 3: Integration | 4 | 0 | 0 | 4 | 0% |
| **TOTAL** | **40** | **0** | **0** | **40** | **0%** |

### Execution Details

- **Start Time**: Not started
- **End Time**: -
- **Total Duration**: -
- **Average Test Duration**: -
- **Slowest Test**: -
- **Fastest Test**: -

### Test Environment

| Parameter | Value |
|-----------|-------|
| Test Timeout | 10 seconds |
| Browser | Chromium (Playwright) |
| Base URL | http://bondvision-digital:3002 |
| API URL | http://bondvision-backend:3000/api |
| Database | PostgreSQL (reset before run) |
| Expected Initial Users | 2 (admin + demo) |

### Failure Analysis

_No tests executed yet_

### Critical Failures

_None_

### Validation Checklist

- [ ] All 40 tests executed
- [ ] Pass rate ≥ 95% (38/40 minimum)
- [ ] Database restored to initial state (admin + demo)
- [ ] No JavaScript console errors
- [ ] Report files generated (HTML, CSV, XLSX)
- [ ] Total execution time < 8 minutes

---

## NOTES

### Known Issues
- Admin Panel user creation: form fields IDs needed
- Column drag & drop: implementation TBD
- Filter inputs: selector strategy TBD
- Reset All Columns: button selector TBD

### Prerequisites
1. Database initialized with baseline users: admin + demo
2. Frontend environment variable API_URL set correctly
3. All services running (frontend, backend, postgres, redis)
4. Browser launched with devtools for debugging

### Post-Test Actions
1. Generate HTML report (Testing/test-report.html)
2. Generate CSV export (Testing/test-results.csv)
3. Generate Excel report (Testing/TEST_RESULTS.xlsx)
4. Archive test run with timestamp
5. Update TEST_PLAN_FINAL.md with findings


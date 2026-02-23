# MTS-Stratos Test Checklist

**Data creazione**: 2026-02-20  
**Ultima esecuzione**: 2026-02-23  
**Timeout per test**: 10 secondi  
**Totale test**: 41  
**Focus**: GUI con API secondarie

---

## SECTION 1: USER MANAGEMENT - Admin Panel (24 tests)

### Subsection A: Admin Profile (11 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T01 | Login Admin (GUI) | GUI | âœ… RUN | PASS | 4583 ms | - |
| T02 | Open Admin Panel | GUI | âœ… RUN | PASS | 473 ms | - |
| T03 | Create Admin user | GUI | âœ… RUN | PASS | 483 ms | - |
| T04 | Login nuovo Admin | GUI | âœ… RUN | PASS | 2117 ms | - |
| T05 | Logout Admin-test | GUI | âœ… RUN | PASS | 137 ms | - |
| T06 | Disable Admin-test | GUI | âœ… RUN | PASS | 2409 ms | - |
| T07 | Login utente disabilitato | GUI | âœ… RUN | PASS | 2241 ms | - |
| T08 | Riattivazione Admin-test | GUI | âœ… RUN | PASS | 1603 ms | - |
| T09 | Login post-riattivazione | GUI | âœ… RUN | PASS | 1459 ms | - |
| T10 | Delete Admin-test | GUI | âœ… RUN | PASS | 2363 ms | - |
| T11 | Verify DB clean (API) | API | âœ… RUN | PASS | 72 ms | - |
### Subsection B: Trader Profile (5 tests)

| ID | Test Description | Type | Status | Pass/Fail | Duration | Notes |
|----|----|-----|--------|-----------|----------|--------|
| T12 | Create Trader user | GUI | âœ… RUN | PASS | 221 ms | - |
| T13 | Login Trader | GUI | âœ… RUN | PASS | 1610 ms | - |
| T14 | Logout Trader | GUI | âœ… RUN | PASS | 139 ms | - |
| T15 | Disable/Enable Trader cycle | GUI | âœ… RUN | PASS | 8734 ms | - |
| T16 | Delete Trader | GUI | âœ… RUN | PASS | 2333 ms | - |

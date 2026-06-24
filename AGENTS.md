# AGENTS

## Working Rules

- Never implement functional behavior changes unless the user explicitly asks for them and approves them.
- By default, limit changes to non-functional fixes (e.g., styling, localization text, bug fixes that preserve intended behavior).
- For frontend changes, make updates available as fast as possible without requiring manual user actions (prefer automatic fast refresh/restart steps).

## Documentation Rules

- All documentation files (`.md`) must be written in **English**.
- When translating or updating existing documentation that is in Italian, always convert it to English.

## Localization Rules

- The application UI must always be localized in **both English (EN) and Italian (IT)**.
- All user-visible strings must be added to `src/context/LanguageContext.jsx` under both `translations.en` and `translations.it`.
- Never hardcode display strings directly in components — always use the `t('key')` function from `useLanguage()`.
- When adding a new feature with UI strings, add the EN and IT translations as part of the same implementation step.

## Frontend Availability SOP

- After any frontend file change, the agent must make changes visible immediately without asking manual user actions.
- Default fast path (Docker): run `docker restart -t 0 mts-stratos-bondvision-digital`.
- Immediate verification: run `docker ps --filter "name=mts-stratos-bondvision-digital" --format "table {{.Names}}\t{{.Status}}"` and confirm container is `Up`.
- Only if startup problems are suspected, check logs with `docker logs --tail 30 mts-stratos-bondvision-digital`.
- Do not ask the user to perform refresh/restart steps before the agent has executed this SOP.

## E2E Test SOP

### How to launch

- Primary entry point: run `powershell -NoProfile -ExecutionPolicy Bypass -File .\run-live.ps1` from the repo root.
- `run-live.ps1` delegates to `Testing/run-e2e-live.ps1 -NoOpenLiveBrowser`, which:
  1. Ensures the required containers are up via `docker-compose -f docker-compose.master.yml up -d postgres redis pgadmin bondvision-backend-java bondvision-digital`.
  2. Resets auth/session state in PostgreSQL and Redis for a deterministic run.
  3. Installs the Playwright Chromium browser if missing.
  4. Runs the live E2E suite (`npm run e2e:live` → `scripts/e2e-final.mjs`).
  5. Refreshes reports (`test-results.json/csv`, `test-report.html`) and performs post-run cleanup.

### Container / service names (must match `docker-compose.master.yml`)

- Backend **service** name is `bondvision-backend-java` (not `bondvision-backend`).
- Container names: `mts-stratos-bondvision-digital`, `mts-stratos-backend-java`, `mts-stratos-postgres`, `mts-stratos-redis`, `mts-stratos-pgadmin`.

### Endpoints used by the suite

- Frontend `BASE_URL`: `http://localhost:3002`.
- Backend `API_BASE`: `http://localhost:3003/api` (host port 3003 maps to container port 3001).

### Test specs (Test Explorer)

- `tests-live/full-suite.case-by-case.spec.mjs`: runs the suite once in `beforeAll`, then reports PASS/FAIL per individual test case (`T01`…`T47`). Use for CI / precise diagnosis.
- `tests-live/full-suite.ui.spec.mjs`: runs the suite as a single aggregated test with visible browser (`liveView=true`, `slowMo=250ms`). Use for visual / demo runs.
- Both wrap the same underlying `runE2ESuite` from `scripts/e2e-final.mjs`.

### Notes

- If containers were deleted/renamed, align service names in `Testing/run-e2e-live.ps1` to the actual services in `docker-compose.master.yml` before running.
- Excel report generation (`generate-excel-report.py`) requires Python with `openpyxl`; a missing module only warns and does not fail the run.


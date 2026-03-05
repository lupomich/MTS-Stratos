# E2E DB Snapshot Runbook

For a complete overview of all E2E scripts and their parameters, see `Testing/E2E_SCRIPTS_USER_MANUAL.md`.

## Objective
Preserve real DB data and, when needed, keep a copy of the post-test state for troubleshooting.

## Main Commands

### 1) Standard run (automatic restore, no persistent snapshot)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1
```

### 2) Recommended troubleshooting run (saves post-test only on FAIL)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepPostTestDbOnFailure
```

### 3) Audit/compliance run (always saves pre + post)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepDbSnapshots
```

### 4) Fast CI run (no DB backup/restore)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -SkipDbBackupRestore
```

## File Locations
- Test reports:
  - `Testing/test-report.html`
  - `Testing/test-results.csv`
  - `Testing/test-results.json`
- DB snapshots (if kept):
  - `Testing/db-snapshots/pre-e2e-<runId>.dump`
  - `Testing/db-snapshots/post-e2e-<runId>.dump`

## Troubleshooting Procedure (step-by-step)
1. Run the suite with `-KeepPostTestDbOnFailure`.
2. On failure, get the `runId` from the post-test snapshot name.
3. Read `Testing/test-results.json` for the failed test.
4. Restore the post-test snapshot to a dedicated DB (`stratos_debug`) for investigation.
5. Verify queries and application state without impacting the main DB.

## Restore post-test snapshot to debug DB (example)

### Create debug DB in the postgres container
```powershell
docker exec mts-stratos-postgres sh -lc "PGPASSWORD='stratos2026' psql -U stratos -d postgres -c 'DROP DATABASE IF EXISTS stratos_debug;'"
docker exec mts-stratos-postgres sh -lc "PGPASSWORD='stratos2026' psql -U stratos -d postgres -c 'CREATE DATABASE stratos_debug;'"
```

### Copy dump and restore
```powershell
docker cp .\Testing\db-snapshots\post-e2e-<runId>.dump mts-stratos-postgres:/tmp/post-e2e.dump
docker exec mts-stratos-postgres sh -lc "PGPASSWORD='stratos2026' pg_restore -U stratos -d stratos_debug --clean --if-exists --no-owner --no-privileges /tmp/post-e2e.dump"
```

## Operational Notes
- The E2E script always restores the main DB to the pre-test snapshot if backup is active.
- With `-KeepDbSnapshots` the dumps are not deleted automatically.
- With `-KeepPostTestDbOnFailure` the post-test dump is kept only if the suite fails.
- The test cleanup resets Postgres/Redis volumes but preserves `pgadmin-data`, so saved pgAdmin connections remain available.

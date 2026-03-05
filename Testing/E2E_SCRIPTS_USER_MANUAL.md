# MTS-Stratos E2E Scripts - User Manual

## Objective
Quick guide to using the E2E scripts in `Testing/`, focused on fast startup, UI/headless modes, and DB safety (backup/restore).

## Available Scripts (current state)

### 0) `run-e2e-ui-full.ps1` (one-command UI launcher)
Simplified launcher: starts the full suite in Playwright UI mode from T1 with a single command.
On startup it also tries to automatically open the browser at `http://localhost:9323`.
The UI is started in the background in the `e2e` container, so it does not close if the command terminal exits.

```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-ui-full.ps1
```

UI on custom port:

```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-ui-full.ps1 -UiPort 9333
```

Internally uses `run-e2e-hot.ps1` with DB backup/restore active by default.

### 0b) `run-e2e-auto-full.ps1` (one-command AUTO launcher)
Simplified launcher: starts the full suite from T1 automatically (headless), with no manual clicks.

```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-auto-full.ps1
```

### 1) `run-e2e-hot.ps1` (recommended for daily use)
Fast runner with always-running E2E container (`mts-stratos-e2e`) and hot test launch via `docker exec`.

**Typical usage**
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-hot.ps1 -StartFromOverride 1
```

**Parameters**
- `-StartFromOverride <int>`: starting test (default `1`)
- `-SlowMoMs <int>`: slow down Playwright actions in headless mode (default `0`)
- `-UsePlaywrightUI`: launch UI mode (`--ui`)
- `-UiPort <int>`: Playwright UI port (default `9323`)
- `-KeepDbSnapshots`: keep post-run snapshots as well
- `-SkipDbBackupRestore`: disable DB backup/restore (only if needed)

**DB behavior (default)**
- Automatic pre-run backup
- Automatic restore at end of run (even on error)

---

### 2) `run-e2e-full.ps1` (full/official run)
Full runner with extended pipeline: DB backup/restore, checkpoint on fail, report export, checklist/plan update.

**Typical usage**
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -StartFromOverride 1
```

**Main parameters**
- `-StartFromOverride <int>`
- `-SkipDbBackupRestore`
- `-KeepDbSnapshots`
- `-KeepPostTestDbOnFailure`
- `-ResetTestVolumes`

**When to use**
- full validation run
- pre-release run
- run with full artifact and test document tracking

---

### 3) `run-e2e-live.ps1` (visual debug)
Live runner for observing the browser in real time, with Inspector/UI option.

**Typical usage**
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250
```

**Parameters**
- `-StartFromOverride <int>`
- `-SlowMoMs <int>`
- `-DebugInspector`
- `-UsePlaywrightUI`

**When to use**
- interactive debug and GUI troubleshooting
- visual verification of UI behavior

## Recommended flow (streamlined)
1. **Default**: `run-e2e-hot.ps1`
2. **Visual debug**: `run-e2e-live.ps1`
3. **Official run / full reporting**: `run-e2e-full.ps1`

## Prerequisites
- Docker Desktop active
- `docker-compose.master.yml` present in root
- Local ports free (at least `3000`, `3002`, `5432`, `5050`; `9323` if using UI)

## Main Outputs
- `Testing/test-report.html`
- `Testing/test-results.csv`
- `Testing/test-results.json`
- DB snapshots (if kept): `Testing/db-snapshots/*.dump`

## Notes on generated files
Files such as CSV/HTML/JSON reports, xlsx, and logs are run artifacts; they are not runtime scripts.

## Duplicates (verification)
- In `Testing/` the `.ps1` scripts are **5 and all distinct**.
- No duplicate E2E scripts named `run-e2e*.ps1` found in other workspace folders.

# Live View E2E (Playwright)

For a complete up-to-date guide to all E2E scripts (hot/full/live), see also `Testing/E2E_SCRIPTS_USER_MANUAL.md`.

## Maximized browser

In visible mode (`headless=false`) the browser is always opened maximized, both in classic live mode and in Playwright UI.

## How to launch the suite

### A) Without UI (classic live)
Runs the custom suite with the browser visible.

```powershell
.\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250
```

With Playwright inspector:

```powershell
.\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250 -DebugInspector
```

### B) With UI (Playwright `--ui`)
Opens the Playwright UI for interactive start/stop of the suite wrapper.

```powershell
.\Testing\run-e2e-live.ps1 -UsePlaywrightUI -StartFromOverride 1 -SlowMoMs 250
```

## Useful parameters

- `-StartFromOverride 1` → full run from T1
- `-StartFromOverride 46` → run from a specific test
- `-SlowMoMs 250` → slow down actions for observation

## Operational notes

- Required services: `postgres`, `redis`, `bondvision-backend`, `bondvision-digital`.
- The PowerShell script automatically starts the required services.
- URLs used locally:
  - Frontend: `http://localhost:3002`
  - Backend API: `http://localhost:3000/api`

## Fast run (always-running E2E container)

The full suite now uses a persistent `e2e` container (`mts-stratos-e2e`) and launches tests with `docker exec`.
This avoids recreating the container on every run and reduces startup time.

Full run (from T1):

```powershell
.\Testing\run-e2e-full.ps1 -StartFromOverride 1
```

Run from a specific test:

```powershell
.\Testing\run-e2e-full.ps1 -StartFromOverride 43
```

### DB Backup/Restore

- DB pre-run backup and automatic restore at end of run remain active.
- To skip it (only when needed): `-SkipDbBackupRestore`.

## Parametric hot script (UI / headless)

For fast runs with runtime parameters, use:

```powershell
.\Testing\run-e2e-hot.ps1 -StartFromOverride 1
```

Examples:

```powershell
# headless, from T43
.\Testing\run-e2e-hot.ps1 -StartFromOverride 43 -SlowMoMs 0

# Playwright UI (then open http://localhost:9323)
.\Testing\run-e2e-hot.ps1 -UsePlaywrightUI -StartFromOverride 1 -UiPort 9323
```

DB behavior in the hot script:

- Automatic pre-run backup
- Automatic restore at end of run (even on error)
- Optional post-run snapshot with `-KeepDbSnapshots`

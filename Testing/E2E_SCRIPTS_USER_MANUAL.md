# MTS-Stratos E2E Scripts - User Manual

## Obiettivo
Guida rapida all'uso degli script E2E in `Testing/`, con focus su avvio veloce, modalità UI/no-UI, e sicurezza DB (backup/restore).

## Script disponibili (stato attuale)

### 0) `run-e2e-ui-full.ps1` (one-command launcher UI)
Launcher semplificato: avvia la suite completa in modalità Playwright UI da T1 con un solo comando.
All'avvio prova anche ad aprire automaticamente il browser su `http://localhost:9323`.
La UI viene avviata in background nel container `e2e`, quindi non si chiude se il terminale del comando termina.

```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-ui-full.ps1
```

UI su porta custom:

```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-ui-full.ps1 -UiPort 9333
```

Usa internamente `run-e2e-hot.ps1` con backup/restore DB attivo di default.

### 0b) `run-e2e-auto-full.ps1` (one-command launcher AUTO)
Launcher semplificato: avvia la suite completa da T1 in modo automatico (headless), senza click manuali.

```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-auto-full.ps1
```

### 1) `run-e2e-hot.ps1` (consigliato per uso quotidiano)
Runner veloce con container E2E sempre attivo (`mts-stratos-e2e`) e lancio test a caldo via `docker exec`.

**Uso tipico**
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-hot.ps1 -StartFromOverride 1
```

**Parametri**
- `-StartFromOverride <int>`: test iniziale (default `1`)
- `-SlowMoMs <int>`: rallenta azioni Playwright in no-UI (default `0`)
- `-UsePlaywrightUI`: avvia modalità UI (`--ui`)
- `-UiPort <int>`: porta UI Playwright (default `9323`)
- `-KeepDbSnapshots`: conserva anche snapshot post-run
- `-SkipDbBackupRestore`: disattiva backup/restore DB (solo se necessario)

**Comportamento DB (default)**
- Backup pre-run automatico
- Restore automatico a fine run (anche in caso di errore)

---

### 2) `run-e2e-full.ps1` (run completo/ufficiale)
Runner completo con pipeline estesa: backup/restore DB, checkpoint su fail, export report, aggiornamento checklist/plan.

**Uso tipico**
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -StartFromOverride 1
```

**Parametri principali**
- `-StartFromOverride <int>`
- `-SkipDbBackupRestore`
- `-KeepDbSnapshots`
- `-KeepPostTestDbOnFailure`
- `-ResetTestVolumes`

**Quando usarlo**
- run di validazione completa
- run pre-rilascio
- run con tracciamento completo artefatti e documenti test

---

### 3) `run-e2e-live.ps1` (debug visuale)
Runner live per osservare browser in tempo reale, con opzione Inspector/UI.

**Uso tipico**
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250
```

**Parametri**
- `-StartFromOverride <int>`
- `-SlowMoMs <int>`
- `-DebugInspector`
- `-UsePlaywrightUI`

**Quando usarlo**
- debug interattivo e troubleshooting GUI
- verifica visuale comportamento UI

## Flusso consigliato (snello)
1. **Default**: `run-e2e-hot.ps1`
2. **Debug visuale**: `run-e2e-live.ps1`
3. **Run ufficiale/reportistica completa**: `run-e2e-full.ps1`

## Prerequisiti
- Docker Desktop attivo
- `docker-compose.master.yml` presente in root
- Porte locali libere (almeno `3000`, `3002`, `5432`, `5050`; `9323` se UI)

## Output principali
- `Testing/test-report.html`
- `Testing/test-results.csv`
- `Testing/test-results.json`
- Snapshot DB (se mantenuti): `Testing/db-snapshots/*.dump`

## Note su file generati
File come report CSV/HTML/JSON, xlsx e log sono artefatti di run; non sono script di runtime.

## Duplicati (verifica)
- In `Testing/` gli script `.ps1` risultano **5 e tutti distinti**.
- Non risultano script E2E duplicati con nome `run-e2e*.ps1` in altre cartelle del workspace.

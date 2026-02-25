# Live View E2E (Playwright)

Per una guida completa aggiornata di tutti gli script E2E (hot/full/live), vedi anche `Testing/E2E_SCRIPTS_USER_MANUAL.md`.

## Browser massimizzato

In modalità visibile (`headless=false`) il browser viene aperto sempre massimizzato, sia in live classica che in Playwright UI.

## Come lanciare la suite

### A) Senza UI (live classica)
Esegue la suite custom con browser visibile.

```powershell
.\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250
```

Con inspector Playwright:

```powershell
.\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250 -DebugInspector
```

### B) Con UI (Playwright `--ui`)
Apre la UI Playwright per avvio/stop interattivo del wrapper suite.

```powershell
.\Testing\run-e2e-live.ps1 -UsePlaywrightUI -StartFromOverride 1 -SlowMoMs 250
```

## Parametri utili

- `-StartFromOverride 1` → esecuzione completa da T1
- `-StartFromOverride 46` → esecuzione da test specifico
- `-SlowMoMs 250` → rallentamento azioni per osservazione

## Note operative

- Servizi richiesti: `postgres`, `redis`, `bondvision-backend`, `bondvision-digital`.
- Lo script PowerShell avvia automaticamente i servizi necessari.
- URL usati in locale:
  - Frontend: `http://localhost:3002`
  - Backend API: `http://localhost:3000/api`

## Esecuzione rapida (container E2E sempre attivo)

La suite full ora usa un container `e2e` persistente (`mts-stratos-e2e`) e lancia i test con `docker exec`.
Questo evita la creazione del container ad ogni run e riduce il tempo di start.

Run completo (da T1):

```powershell
.\Testing\run-e2e-full.ps1 -StartFromOverride 1
```

Run da test specifico:

```powershell
.\Testing\run-e2e-full.ps1 -StartFromOverride 43
```

### Backup/Restore DB

- Rimane attivo il backup DB pre-run e restore automatico a fine run.
- Per saltarlo (solo quando serve): `-SkipDbBackupRestore`.

## Script hot parametrico (UI / no UI)

Per run rapidi con parametri runtime usa:

```powershell
.\Testing\run-e2e-hot.ps1 -StartFromOverride 1
```

Esempi:

```powershell
# no UI (headless), da T43
.\Testing\run-e2e-hot.ps1 -StartFromOverride 43 -SlowMoMs 0

# Playwright UI (apri poi http://localhost:9323)
.\Testing\run-e2e-hot.ps1 -UsePlaywrightUI -StartFromOverride 1 -UiPort 9323
```

Comportamento DB nello script hot:

- Backup pre-run automatico
- Restore automatico a fine run (anche in caso di errore)
- Snapshot post-run opzionale con `-KeepDbSnapshots`

# E2E DB Snapshot Runbook

## Obiettivo
Preservare i dati reali del DB e, quando serve, mantenere una copia dello stato post-test per troubleshooting.

## Comandi principali

### 1) Run standard (restore automatico, nessuno snapshot persistente)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1
```

### 2) Run troubleshooting consigliato (salva post-test solo su FAIL)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepPostTestDbOnFailure
```

### 3) Run audit/compliance (salva sempre pre + post)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -KeepDbSnapshots
```

### 4) Run CI veloce (niente backup/restore DB)
```powershell
powershell -ExecutionPolicy Bypass -File .\Testing\run-e2e-full.ps1 -SkipDbBackupRestore
```

## Dove trovare i file
- Report test:
  - `Testing/test-report.html`
  - `Testing/test-results.csv`
  - `Testing/test-results.json`
- Snapshot DB (se mantenuti):
  - `Testing/db-snapshots/pre-e2e-<runId>.dump`
  - `Testing/db-snapshots/post-e2e-<runId>.dump`

## Procedura troubleshooting (step-by-step)
1. Esegui la suite con `-KeepPostTestDbOnFailure`.
2. In caso di fail, prendi il `runId` dal nome snapshot post-test.
3. Leggi `Testing/test-results.json` per il test fallito.
4. Ripristina lo snapshot post-test in un DB dedicato (`stratos_debug`) per indagine.
5. Verifica query e stato applicativo senza impattare il DB principale.

## Restore snapshot post-test in DB debug (esempio)

### Crea DB debug nel container postgres
```powershell
docker exec mts-stratos-postgres sh -lc "PGPASSWORD='stratos2026' psql -U stratos -d postgres -c 'DROP DATABASE IF EXISTS stratos_debug;'"
docker exec mts-stratos-postgres sh -lc "PGPASSWORD='stratos2026' psql -U stratos -d postgres -c 'CREATE DATABASE stratos_debug;'"
```

### Copia dump e ripristina
```powershell
docker cp .\Testing\db-snapshots\post-e2e-<runId>.dump mts-stratos-postgres:/tmp/post-e2e.dump
docker exec mts-stratos-postgres sh -lc "PGPASSWORD='stratos2026' pg_restore -U stratos -d stratos_debug --clean --if-exists --no-owner --no-privileges /tmp/post-e2e.dump"
```

## Note operative
- Lo script E2E ripristina sempre il DB principale allo snapshot pre-test se il backup è attivo.
- Con `-KeepDbSnapshots` i dump non vengono cancellati automaticamente.
- Con `-KeepPostTestDbOnFailure` il dump post-test viene mantenuto solo se la suite fallisce.
- Il cleanup test resetta i volumi Postgres/Redis ma preserva `pgadmin-data`, quindi le connessioni salvate in pgAdmin restano disponibili.

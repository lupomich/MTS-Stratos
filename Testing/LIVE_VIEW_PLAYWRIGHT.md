# Live View E2E (Playwright)

## Modalità disponibili

### 1) Live classica (browser visibile)
Esegue la suite custom in modalità headed con rallentamento azioni.

```powershell
.\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250
```

Con inspector:

```powershell
.\Testing\run-e2e-live.ps1 -StartFromOverride 1 -SlowMoMs 250 -DebugInspector
```

### 2) Playwright UI nativa (`--ui`)
Apre l'interfaccia Playwright UI e consente avvio/stop interattivo del test wrapper.

```powershell
.\Testing\run-e2e-live.ps1 -UsePlaywrightUI -StartFromOverride 1 -SlowMoMs 250
```

## Note operative

- Servizi richiesti: `postgres`, `redis`, `bondvision-backend`, `bondvision-digital`.
- Lo script PowerShell avvia automaticamente i servizi necessari.
- URL usati in locale per live/UI:
  - Frontend: `http://localhost:3002`
  - Backend API: `http://localhost:3000/api`
- Per eseguire solo da un test specifico, cambia `-StartFromOverride` (es. `46`).

# Live View E2E (Playwright)

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

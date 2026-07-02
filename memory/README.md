# memory/

Snapshot di sessione e handoff file per continuità di lavoro tra sessioni.
Formato nome: `YYYY-MM-DD--descrizione.md`

| File | Data | Contenuto |
|---|---|---|
| [2026-02-18--deployment-status.md](2026-02-18--deployment-status.md) | 2026-02-18 | Status deployment Docker completato |
| [2026-02-23--automation-enhancement.md](2026-02-23--automation-enhancement.md) | 2026-02-23 | Sommario enhancement automazione E2E |
| [2026-07-01--ag-grid-migration.md](2026-07-01--ag-grid-migration.md) | 2026-07-01 | **HANDOFF ATTIVO** — Piano migrazione AG Grid v31→v36 |

## Come usare questo folder

- Ogni sessione di lavoro che produce un piano, un'analisi o uno stato da portare avanti crea un file `YYYY-MM-DD--titolo.md`.
- Il file più recente è il punto di pick-up per la sessione successiva.
- I file più vecchi rimangono come storico decisionale.

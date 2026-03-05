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

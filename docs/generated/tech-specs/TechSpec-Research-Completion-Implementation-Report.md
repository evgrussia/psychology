# TechSpec-Research-Completion — Implementation Report

## Scope covered
- Added missing IA route for contacts and wired it into navigation.
- Normalized Telegram CTA tracking and deep-link attribution for prep/thermometer/events.
- Aligned interactive analytics events with Tracking Plan (consultation prep, resource thermometer, crisis trigger types).
- Seeded full interactive data (thermometer, prep, ritual) and sample events for deterministic dev/test flows.
- Added sitemap + robots for SEO coverage.
- Added E2E coverage for navigator, thermometer, prep, rituals, events, Telegram CTA.
- Created `docs/Research-Coverage-Matrix.md` for traceability.

## Key entry points
- Web routes: `apps/web/src/app/*` (notably `contacts`, `events`, `start/*`).
- Telegram deep links: `apps/web/src/lib/telegram.ts`, `apps/api/src/application/telegram/*`.
- Interactive flows: `apps/web/src/app/start/*`, `apps/api/src/application/interactive/*`.
- Coverage matrix: `docs/Research-Coverage-Matrix.md`.

## Tests and verification
- Web e2e (new/updated):
  - `apps/web/e2e/navigator.spec.ts`
  - `apps/web/e2e/resource-thermometer.spec.ts`
  - `apps/web/e2e/consultation-prep.spec.ts`
  - `apps/web/e2e/rituals.spec.ts`
  - `apps/web/e2e/events.spec.ts`
- Attempted:
  - `pnpm --filter @psychology/web e2e -- --grep "Navigator|Resource thermometer|Consultation prep|Rituals|Events"` (failed: API webServer could not connect to PostgreSQL at `localhost:5433`)
- Suggested commands after DB is running:
  - `pnpm --filter @psychology/web e2e`

## Outstanding / blockers
- Playwright webServer requires test DB at `localhost:5433` (see `apps/api/test.env`). Start the test DB before running e2e.
- Reference doc `docs/generated/frontend/QPsychology-Complete-Design-Specification.md` is missing (a11y doc points to it).
- Telegram bot flows require real bot token and channel configuration for live validation.

## Notes
- Coverage matrix includes planned items (e.g., breadcrumbs) but no out-of-scope items without ADR.

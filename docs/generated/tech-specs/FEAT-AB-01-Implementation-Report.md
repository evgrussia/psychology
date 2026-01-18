# FEAT-AB-01 Implementation Report

## Scope & DoD coverage
- A/B infrastructure: assignments with 30‑day stickiness, randomization by anonymous/user ID, and user_id stitching are implemented in API.
- Exposure tracking: `experiment_exposed` event is emitted on first exposure per session and validated by analytics guardrails.
- Metrics dashboard: Admin page shows exposures and conversion rates per variant.
- Privacy: experiment events carry only IDs/variants/surface; analytics validators block PII.

## Key changes
- API: experiment catalog, assignment endpoint, repository, and analytics aggregation.
- Web: experiment client hook, exposure event, and Home page variant split for `EXP-HP-CTA-01`.
- Admin: experiments analytics page with range filters.
- Tracking: `experiment_exposed` added to tracking plan and allowed event lists.

## Entry points
- Public assignment API: `apps/api/src/presentation/controllers/experiments.controller.ts`
- Assignment use case: `apps/api/src/application/experiments/use-cases/GetExperimentAssignmentUseCase.ts`
- Experiment catalog: `apps/api/src/application/experiments/experiments-catalog.ts`
- Admin analytics use case: `apps/api/src/application/admin/use-cases/analytics/GetAdminExperimentResultsUseCase.ts`
- Admin UI: `apps/admin/src/app/analytics/experiments/page.tsx`
- Web experiment hook: `apps/web/src/lib/experiments.ts`
- Home experiment integration: `apps/web/src/app/HomeClient.tsx`

## How to run / verify
1. Start API and Admin apps.
2. Visit `/` on web, verify `experiment_exposed` in analytics ingest.
3. Open admin `/analytics/experiments` to see exposures and conversions.
4. Ensure analytics payloads contain no PII (PII guardrails will block).

## Tests
- Added e2e coverage: `apps/api/test/experiments-assignment.e2e-spec.ts`

## Notes / follow-ups
- `EXP-HP-CTA-01` uses `cta_tg_click` as primary metric in the dashboard (proxy for TG subscribe) because Telegram events currently do not carry experiment context.
- Other experiments are listed as `draft` and require UI integration to emit exposures/metrics on their respective surfaces.

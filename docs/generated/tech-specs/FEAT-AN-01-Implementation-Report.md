# FEAT-AN-01 Implementation Report

## Summary
- Implemented unified analytics ingestion flow with strict event dictionary and PII/text validators on client and server.
- Added self-hosted analytics storage (`analytics_events`) and lead timeline updates for contact events.
- Wired backend tracking events to ingestion with consistent schema (schema_version, event_id, source, env, ids).

## Acceptance Criteria Coverage
- **AC-1 (минимальный набор событий):** поддерживаются события из PRD (booking/quiz/FAQ/CTA/TG/waitlist) и полный словарь из Tracking Plan.
- **AC-2 (валидатор запретов):** валидация запретов на PII/текст реализована в web и backend (блокирует отправку/ингест).

## Key Changes (Where)
- `apps/web/src/lib/tracking.ts`: единый `track()` с проверкой словаря, PII, `lead_id` и отправкой в `/api/analytics/ingest`.
- `apps/web/src/lib/analytics-events.ts`: словарь допустимых событий.
- `apps/api/src/presentation/controllers/analytics.controller.ts`: `POST /api/analytics/ingest`.
- `apps/api/src/application/analytics/use-cases/IngestAnalyticsEventUseCase.ts`: валидация, сохранение события, связь с lead.
- `apps/api/src/application/analytics/analytics-validator.ts`: правила запретов (PII/текст).
- `apps/api/src/domain/analytics/repositories/IAnalyticsEventRepository.ts` и `apps/api/src/infrastructure/persistence/prisma/analytics/prisma-analytics-event.repository.ts`.
- `apps/api/prisma/schema.prisma`: модель `analytics_events`.
- `apps/api/src/infrastructure/tracking/tracking.service.ts`: серверные события → ingestion.

## Data Model
- Новая таблица `analytics_events` (P0) с индексами по `event_name/occurred_at/source/lead_id`.

## Tests
- Unit: `pnpm --filter @psychology/api test analytics-validator.spec.ts`
- E2E: `pnpm --filter @psychology/api test:e2e -- analytics-ingest.e2e-spec.ts`

## Env / Config Notes
- Web: `NEXT_PUBLIC_API_URL` (используется для `/api/analytics/ingest`).

## Blockers / Gaps
- E2E тест не запущен из-за отсутствия тестовой БД на `localhost:5433`.  
  Нужно поднять инфраструктуру: `pnpm test:infra:up`, затем повторить `test:e2e`.

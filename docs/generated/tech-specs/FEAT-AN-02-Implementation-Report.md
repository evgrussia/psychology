# FEAT-AN-02 — Implementation Report

Дата: 2026-01-17  
Статус: ✅ Completed

## Что реализовано

- Серверные события истины для `booking_paid` и `booking_confirmed` отправляются из backend use cases.
- Добавлено событие `appointment_outcome_recorded` из админки (источник истины для no-show).
- Дедупликация аналитики по `event_id` на уровне ingest.
- Склейка серверных событий с Telegram через `deep_link_id` без PII (если доступен у лида).

## Где в коде

- Дедуп ingest и аналитика: `apps/api/src/application/analytics/use-cases/IngestAnalyticsEventUseCase.ts`
- Репозиторий аналитики: `apps/api/src/infrastructure/persistence/prisma/analytics/prisma-analytics-event.repository.ts`
- Серверные события платежей/подтверждения:  
  - `apps/api/src/application/payment/use-cases/HandlePaymentWebhookUseCase.ts`  
  - `apps/api/src/application/booking/use-cases/ConfirmAppointmentAfterPaymentUseCase.ts`
- Outcome в админке:  
  - `apps/api/src/application/admin/use-cases/schedule/RecordAppointmentOutcomeUseCase.ts`  
  - `apps/api/src/presentation/controllers/admin-schedule.controller.ts`
- Deep link resolve для событий истины: `apps/api/src/infrastructure/persistence/prisma/crm/prisma-lead.repository.ts`
- Миграция: `apps/api/prisma/migrations/20260117180000_add_unique_event_id_to_analytics_events/migration.sql`

## API / Контракты

- `POST /api/admin/schedule/appointments/:id/outcome`
  - body: `{ outcome, reason_category? }`
  - outcome: `attended | no_show | canceled_by_client | canceled_by_provider | rescheduled`
  - reason_category: `late_cancel | tech_issue | illness | other | unknown`

## Проверки / тесты

- `pnpm --filter @psychology/api test analytics-ingest.e2e-spec`
- `pnpm --filter @psychology/api test payment-confirmation.e2e-spec`

## AC / DoD

- AC-1 (dedupe по `event_id`): ✅ ingest игнорирует дубликаты, добавлен уникальный индекс.
- DoD (истина на сервере + склейка по `deep_link_id` без PII): ✅ `booking_paid`, `booking_confirmed`, `appointment_outcome_recorded` формируются backend и включают `deep_link_id` при наличии.

## Блокеры

- Нет.

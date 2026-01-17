# FEAT-AN-03 Implementation Report

## Scope
Наблюдаемость релиза 1: структурированные логи с редактированием PII/P2, корреляция запросов, алерты по критичным интеграциям (webhooks, payments, calendar sync, telegram) и мониторинг очереди модерации.

## Что реализовано (AC/DoD)
- AC-1 (нет PII/P2 в логах): добавлена единая редукция чувствительных полей и паттернов в логах.  
- AC-2 (healthchecks и базовые алерты): health/ready endpoints уже существуют, добавлены алерты на критичные сбои интеграций и очереди модерации.  
- DoD (наблюдаемость booking/payments/sync/webhooks): алерты на сбои платежей, вебхуков, Google Calendar sync и Telegram API, плюс корреляция запросов через `x-request-id`.

## Основные точки входа
- `apps/api/src/infrastructure/logging/logger.service.ts` — JSON‑логи, редактирование PII/P2, request correlation id.
- `apps/api/src/infrastructure/observability/redaction.ts` — единый redaction helper.
- `apps/api/src/infrastructure/observability/request-context.middleware.ts` — `x-request-id` и AsyncLocalStorage.
- `apps/api/src/infrastructure/observability/alert.service.ts` — отправка алертов через email.
- `apps/api/src/presentation/controllers/yookassa-webhook.controller.ts` — алерты на сбои вебхуков.
- `apps/api/src/infrastructure/integrations/google-calendar-sync.scheduler.ts` — алерты на сбои синхронизации/создания событий.
- `apps/api/src/infrastructure/telegram/telegram-bot.client.ts` — алерты на сбои Telegram API.
- `apps/api/src/infrastructure/integrations/yookassa.service.ts` — алерт на сбой создания платежа.
- `apps/api/src/infrastructure/moderation/moderation-alerts.scheduler.ts` — алерты по лагу очереди модерации.

## Конфигурация (без секретов)
Новые env vars:
- `ALERTS_ENABLED` (по умолчанию включены, `false` отключает отправку)
- `ALERT_EMAIL_TO` (куда отправлять алерты)
- `ALERT_MIN_INTERVAL_MINUTES` (минимальный интервал между одинаковыми алертами)
- `MODERATION_ALERT_INTERVAL_MINUTES` (частота проверки очереди модерации)

## Тесты
Запущено:
- `pnpm --filter @psychology/api test -- src/infrastructure/logging/logger.service.spec.ts`

Не запущено (блокер):
- `pnpm --filter @psychology/api test:e2e -- webhook-alerts.e2e-spec.ts`  
  Причина: тестовая БД недоступна (`localhost:5433`).

## Блокеры / что нужно от пользователя
- Поднять тестовую БД на `localhost:5433` (docker-compose.test) и повторить e2e тест.

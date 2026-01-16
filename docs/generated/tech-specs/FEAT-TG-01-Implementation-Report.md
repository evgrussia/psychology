# FEAT-TG-01 — Implementation Report

Дата: 2026-01-16  
Статус: ✅ выполнено

## Что реализовано (AC/DoD)
- AC-1: public API создаёт deep link и возвращает `deep_link_id` + URL для всех TG CTA.
- AC-2: web-CTA отправляет `cta_tg_click` с `deep_link_id` и `tg_flow` (обновлён concierge CTA).
- AC-3: Telegram-сервис может получить payload через защищённый endpoint и отправить `tg_subscribe_confirmed`.
- DoD: генерация/парсинг payload работает; `deep_link_id` используется без PII и хранится с TTL.

## Основные точки входа
- Backend API: `apps/api/src/presentation/controllers/public/public.controller.ts` (`POST /api/public/deep-links`).
- Telegram API: `apps/api/src/presentation/controllers/telegram-deep-links.controller.ts` (`GET /api/telegram/deep-links/:id`).
- Domain: `apps/api/src/domain/telegram/entities/DeepLink.ts`.
- Application: `apps/api/src/application/telegram/use-cases/CreateDeepLinkUseCase.ts`, `ResolveDeepLinkUseCase.ts`.
- Infrastructure: `apps/api/src/infrastructure/persistence/prisma/telegram/prisma-deep-link.repository.ts`.
- TTL cleanup: `apps/api/src/infrastructure/telegram/deep-link-cleanup.scheduler.ts`.
- Web CTA: `apps/web/src/app/booking/no-slots/NoSlotsClient.tsx`.

## Данные и приватность
- Payload содержит только `dl`, `f`, `t`, `e`, `s` (без PII).
- В БД хранится `anonymous_id` только для внутренней склейки и с TTL.

## Конфигурация (env)
- `TELEGRAM_BOT_USERNAME` (optional, default: `psy_balance_bot`)
- `TELEGRAM_CHANNEL_USERNAME` (optional, default: `TELEGRAM_BOT_USERNAME`)
- `TELEGRAM_SERVICE_TOKEN` (required для `/api/telegram/*`)
- `TELEGRAM_DEEP_LINK_TTL_DAYS` (optional, default: 30)
- `TELEGRAM_DEEP_LINK_CLEANUP_INTERVAL_HOURS` (optional, default: 12)

## БД / миграции
- Prisma: добавлено поле `tg_target` в модель `DeepLink` (нужна миграция при деплое).

## Тесты
- `pnpm --filter @psychology/api test -- deep-link`

## Известные блокеры
- Нет.

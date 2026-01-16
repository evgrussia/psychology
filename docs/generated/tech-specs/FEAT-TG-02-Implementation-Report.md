# FEAT-TG-02 Implementation Report

Дата: 2026-01-16  
Статус: ✅ Implemented

## Что реализовано (AC/DoD)
- **AC-1**: Старт по deep link и продолжение сценария — обработка `/start` с payload, сессии и онбординг.
- **AC-2**: События Telegram в трекинге — `tg_subscribe_confirmed`, `tg_onboarding_completed`, `tg_interaction`, `tg_series_stopped`.
- **AC-3**: Лёгкая остановка серии — `/stop` и кнопка `Стоп`.
- **DoD**: Онбординг (тема/частота), выдача плана/сохранение, консьерж‑ветка записи.
- **Негативный сценарий**: fallback на polling при недоступном webhook (режим `auto`).

## Основные точки входа
- Webhook: `apps/api/src/presentation/controllers/telegram-webhook.controller.ts`
- Обработка апдейтов: `apps/api/src/application/telegram/use-cases/HandleTelegramUpdateUseCase.ts`
- Онбординг: `apps/api/src/application/telegram/use-cases/StartOnboardingUseCase.ts`
- План/челлендж: `apps/api/src/application/telegram/use-cases/SendPlanMessageUseCase.ts`
- Telegram Bot API клиент: `apps/api/src/infrastructure/telegram/telegram-bot.client.ts`
- Polling/auto‑fallback: `apps/api/src/infrastructure/telegram/telegram-updates.service.ts`
- Хранилище сессий/пользователей: `apps/api/src/infrastructure/persistence/prisma/telegram/`
- Модели: `apps/api/prisma/schema.prisma` (`telegram_users`, `telegram_sessions`)

## Конфигурация (без секретов)
Переменные окружения:
- `TELEGRAM_BOT_TOKEN` — токен бота.
- `TELEGRAM_WEBHOOK_URL` — публичный URL `/api/webhooks/telegram`.
- `TELEGRAM_WEBHOOK_SECRET` — опциональный secret для заголовка `X-Telegram-Bot-Api-Secret-Token`.
- `TELEGRAM_UPDATES_MODE` — `auto|webhook|polling` (по умолчанию `auto`).
- `TELEGRAM_POLLING_INTERVAL_MS` — интервал polling (по умолчанию 4000).
- `PUBLIC_WEB_URL` — базовый URL сайта для ссылок из бота.

## Проверка
Локально (без реального TG):
- Unit‑тест: `apps/api/src/application/telegram/use-cases/HandleTelegramUpdateUseCase.spec.ts`

Ручной E2E (по тест‑плану):
1) Открыть deep link → `/start` → пройти онбординг → получить 1 сообщение.
2) Нажать кнопку `Стоп` → получить подтверждение остановки.

## Блокеры
- Нужны реальные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_URL` для live‑проверки webhook/polling.

## Privacy
- Тексты сообщений пользователя **не сохраняются** и **не отправляются** в аналитику.
- В `tg_interaction` сохраняются только `has_text` и `text_length_bucket`.

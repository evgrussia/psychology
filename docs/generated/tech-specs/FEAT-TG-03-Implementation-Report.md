# FEAT-TG-03 Implementation Report

Дата: 2026-01-16  
Статус: ✅ Implemented

## Что реализовано (AC/DoD)
- **AC-1**: CTA на сайте для канала формирует deep link и отправляет `cta_tg_click` с `tg_target=channel`.
- **AC-2**: `tg_subscribe_confirmed` фиксируется через бота по кнопке подтверждения подписки.
- **DoD**: CTA ведёт в канал, подтверждение подписки измеряется без PII.

## Основные точки входа
- Web CTA + трекинг: `apps/web/src/app/HomeClient.tsx`
- Deep link builder (channel): `apps/web/src/lib/telegram.ts`
- Обработка подтверждения в боте: `apps/api/src/application/telegram/use-cases/HandleTelegramUpdateUseCase.ts`
- Состояния сессии: `apps/api/src/domain/telegram/value-objects/TelegramEnums.ts`

## Конфигурация (без секретов)
Переменные окружения:
- `TELEGRAM_CHANNEL_USERNAME` — username канала для кнопки из бота.
- `TELEGRAM_BOT_TOKEN` — токен бота (для обработки подтверждения).
- `NEXT_PUBLIC_TELEGRAM_CHANNEL_USERNAME` — fallback username канала на фронтенде.

## Проверка
Локально:
- Unit‑тест: `apps/api/src/application/telegram/use-cases/HandleTelegramUpdateUseCase.spec.ts`
- Unit‑тест: `apps/web/src/app/HomeClient.spec.tsx`

Ручной тест (по test plan):
1) Нажать CTA “Подписаться на канал” на главной.
2) Открыть канал, затем вернуться в бота и нажать “Я подписался(ась)”.
3) Проверить событие `tg_subscribe_confirmed` (tg_target=channel).

## Блокеры
- Для live‑проверки нужны реальные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHANNEL_USERNAME`.

## Privacy
- В события не передаются PII/тексты.

# FEAT-RET-99 — Implementation Report

## Что реализовано
- Добавлена ограниченная и измеримая секция retention‑предложений на главной странице с мягким тоном и без сбора ПДн.
- Реализован контроль включения через feature flags и окно запуска (30+ дней от даты старта).
- Добавлены события аналитики для измерения показов и кликов.
- Обновлён Tracking Plan и словарь допустимых событий.

## Точки входа в коде
- UI секция: `apps/web/src/components/RetentionOffersSection.tsx`
- Вставка на главной: `apps/web/src/app/HomeClient.tsx`
- Feature flags: `apps/web/src/lib/feature-flags.ts`
- Web‑аналитика: `apps/web/src/lib/analytics-events.ts`
- Backend‑словарь аналитики: `apps/api/src/application/analytics/analytics-dictionary.ts`
- Документация трекинга: `docs/Tracking-Plan.md`

## Конфигурация
- `NEXT_PUBLIC_FF_RETENTION` — глобальный флаг секции retention.
- `NEXT_PUBLIC_FF_RETENTION_PACKAGES` — пакеты консультаций.
- `NEXT_PUBLIC_FF_RETENTION_GIFT_CERTIFICATES` — подарочные сертификаты.
- `NEXT_PUBLIC_FF_RETENTION_SOCIAL_MISSION` — социальная миссия.
- `NEXT_PUBLIC_RETENTION_START_AT` — дата старта метрик (ISO, например `2025-12-10`).
- `NEXT_PUBLIC_RETENTION_MIN_DAYS` — минимальное число дней до показа (по умолчанию `30`).

## Проверки / тест-план
- Включить `NEXT_PUBLIC_FF_RETENTION` и нужные флаги механик.
- Убедиться, что секция не появляется до `RETENTION_MIN_DAYS` с `RETENTION_START_AT`.
- Проверить события `retention_offer_viewed` и `retention_offer_click` без PII.
- Запуск тестов: указано в секции результатов ниже.

## Результаты тестов
- `pnpm --filter @psychology/web test`
  - Прошёл успешно (есть stderr‑логи из `page.spec.tsx` и JSDOM‑навигации, но без падений).

## Блокеры
- Нет.

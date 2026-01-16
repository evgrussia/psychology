# Implementation Report - FEAT-PAY-02: YooKassa Webhooks (idempotent)

## Summary
Добавлена безопасная обработка вебхуков ЮKassa с идемпотентностью, защитой от повторов и out-of-order событий, а также серверными событиями аналитики `booking_paid` и `payment_failed`. Реализация полностью соответствует техспеке и не содержит заглушек.

## Что реализовано (по AC/DoD)
- [x] **Идемпотентность**: повторные webhooks не создают дублей эффектов. Проверка по `processed_at` гарантирует, что событие не будет проигнорировано, если предыдущая попытка обработки завершилась сбоем.
- [x] **Обработка out-of-order**: `failed/canceled` после `succeeded` не откатывает оплату.
- [x] **Не подтверждаем запись на основании фронтенда**: подтверждение (статус `confirmed`) идет только по webhook от провайдера.
- [x] **Неизвестный payment_id**: возвращается 202 Accepted + лог (согласно YooKassa docs, чтобы провайдер не спамил ретраями для несуществующих в нашей БД платежей).
- [x] **Валидация**: `YooKassaWebhookVerifier` поддерживает IP allowlist, Basic Auth и HMAC-SHA256 подпись.
- [x] **Tracking**: Реализованы серверные события `payment_started`, `booking_paid` и `payment_failed` согласно Tracking Plan.
- [x] **Тесты**: Покрыты сценарии happy path, дубликатов, out-of-order событий и идемпотентности создания платежа.

## Основные точки входа
- **Webhook Endpoint**: `POST /api/webhooks/yookassa`
- **Application Layer**: `HandlePaymentWebhookUseCase`
- **Infrastructure Layer**:
  - `YooKassaWebhookVerifier`
  - `PrismaPaymentWebhookEventRepository`
  - `TrackingService`

## Как запустить/проверить
1. Убедитесь, что БД доступна и миграции применены.
2. Запустите тесты:
   ```bash
   pnpm --filter @psychology/api test apps/api/src/application/booking/use-cases/PaymentIntegration.spec.ts
   ```
3. Для локальной проверки webhook:
   - Отправьте POST на `/api/webhooks/yookassa` с телом webhook ЮKassa.
   - Настройте один из способов валидации (секрет/allowlist/basic auth).

## Переменные окружения (используемые)
- `YOOKASSA_WEBHOOK_SECRET` — секрет вебхука для HMAC-SHA256.
- `YOOKASSA_WEBHOOK_SIGNATURE_HEADER` — имя заголовка подписи (по умолчанию: `x-yookassa-signature`).
- `YOOKASSA_WEBHOOK_IP_ALLOWLIST` — список разрешенных IP через запятую.
- `YOOKASSA_WEBHOOK_BASIC_AUTH` — `true`, чтобы включить проверку Basic Auth.

## Статус реализации: 100%
Все To Do и заглушки в коде платежной системы удалены. Логика дедупликации усилена проверкой статуса обработки. Добавлено недостающее событие трекинга `payment_started`.

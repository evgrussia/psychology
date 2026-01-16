# Implementation Report - FEAT-PAY-01: YooKassa Integration

## Summary
Реализована интеграция с ЮKassa для создания платежей и обработки вебхуков. Платёж связывается с записью (appointment), поддерживается идемпотентность и автоматическое обновление статуса записи после оплаты.

## Что реализовано (по AC/DoD)
- [x] Создание Payment Intent в ЮKassa с `idempotency_key`.
- [x] Сохранение метаданных платежа в БД (без реквизитов карт).
- [x] Связь платежа с `Appointment`.
- [x] Обработка вебхука ЮKassa (`payment.succeeded`, `payment.canceled`).
- [x] Автоматический переход записи в статус `paid` и затем `confirmed` после успешной оплаты.
- [x] Идемпотентность: повторный запрос с тем же ключом возвращает существующий платёж.
- [x] Интеграционные тесты, покрывающие полный флоу.

## Основные точки входа
- **API Endpoint**: `POST /api/public/payments` (создание платежа)
- **Webhook Endpoint**: `POST /api/public/booking/webhook/yookassa` (обработка статусов)
- **Domain Layer**: `apps/api/src/domain/payment/`
- **Application Layer**: 
  - `CreatePaymentUseCase`
  - `HandlePaymentWebhookUseCase`
- **Infrastructure Layer**:
  - `PrismaPaymentRepository`
  - `YooKassaStub` (заглушка для разработки)

## Как запустить/проверить
1. Убедитесь, что БД запущена и миграции применены.
2. Запустите тесты:
   ```bash
   npm test apps/api/src/application/booking/use-cases/PaymentIntegration.spec.ts
   ```
3. Для ручной проверки в вебе:
   - Пройдите флоу записи до шага оплаты.
   - Нажмите "Перейти к оплате".
   - Вы будете перенаправлены на мок-страницу подтверждения.
   - После подтверждения (симуляция вебхука) запись перейдёт в статус `confirmed`.

## Что не сделано / Блокеры
- Реальная интеграция с API ЮKassa (используется Stub). Для перехода на реальное API нужно заменить `YooKassaStub` на `YooKassaService` с использованием реальных ключей из `.env`.
- Логирование request/response body (намеренно пропущено согласно техспеке для безопасности).

## Дальнейшие шаги
- Реализовать FEAT-PAY-02 (реальный клиент ЮKassa).
- Настроить мониторинг ошибок оплаты в Sentry/ELK.

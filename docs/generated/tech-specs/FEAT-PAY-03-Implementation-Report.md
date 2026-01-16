# FEAT-PAY-03 — Отчёт о реализации

**Статус:** выполнено  
**Дата:** 2026-01-15  

## Что реализовано (AC/DoD)
- Подтверждение записи выполняется только при подтверждённой оплате (проверка статуса платежа в `ConfirmAppointmentAfterPaymentUseCase`).
- Идемпотентность вебхука: повторные события не дублируют оплату, но повторно проверяют подтверждение записи.
- Создание события в Google Calendar защищено от дублей и повторяемо (lock token + проверка `external_calendar_event_id`).
- Добавлен server‑truth трекинг `booking_confirmed` после успешного подтверждения.
- Критический путь покрыт e2e‑тестом.
- Верификация webhook вынесена в защищённый endpoint `/webhooks/yookassa`, публичный endpoint удалён.
- Заменена заглушка email‑сервиса на SMTP‑реализацию.

## Основные точки входа
- `apps/api/src/application/booking/use-cases/ConfirmAppointmentAfterPaymentUseCase.ts`
- `apps/api/src/application/payment/use-cases/HandlePaymentWebhookUseCase.ts`
- `apps/api/src/application/integrations/use-cases/HandleAppointmentConfirmedEvent.ts`
- `apps/api/src/application/integrations/use-cases/CreateCalendarEventForAppointmentUseCase.ts`
- `apps/api/src/infrastructure/persistence/prisma/booking/prisma-appointment.repository.ts`
- `apps/api/src/infrastructure/tracking/tracking.service.ts`

## Как проверить
### Тесты
- E2E критичный путь:  
  `pnpm --filter @psychology/api test:e2e -- test/payment-confirmation.e2e-spec.ts`
- Интеграция календаря (идемпотентность):  
  `pnpm --filter @psychology/api test -- CreateCalendarEventForAppointmentUseCase.spec.ts`

### Переменные окружения
- `DATABASE_URL` (для e2e/integration тестов).

## Что не сделано / блокеры
- Нет блокеров. Внешние интеграции (Google Calendar) в тестах замоканы.

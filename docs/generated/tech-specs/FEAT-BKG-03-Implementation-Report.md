# FEAT-BKG-03 Implementation Report

## Статус
- **Реализовано на 100%**: Основной UI/flow записи, API контракт, анкета с P2-шифрованием, согласия, негативные сценарии, e2e критичного пути.
- **Интеграция**: Реализован эндпоинт `POST /api/public/payments` для создания платежа и `POST /api/public/booking/webhook/yookassa` для обработки подтверждений.
- **Симуляция**: Добавлена симуляция успешной оплаты через асинхронный вызов `ConfirmAppointmentUseCase` (имитация вебхука).
- **Связанные фичи**: `FEAT-BKG-05` (waitlist) — реализована страница `/booking/no-slots` для AC-3.

## Покрытие AC/DoD
- AC-1 Таймзона слотов: отображение слотов в локальной таймзоне пользователя и возможность корректировки таймзоны в UI.
- AC-2 Истина оплаты — backend: статус подтверждения запрашивается через `/api/public/booking/{id}/status`, UI не доверяет фронтенд-успеху.
- AC-3 Нет слотов → `/booking/no-slots/`: предусмотрено состояние и переход.
- AC-4 Анкета не уходит в аналитику: аналитика фиксирует только `has_text_fields`.
- DoD: путь записи полностью реализован от выбора услуги до подтверждения записи после "оплаты".

## Основные изменения по слоям
- **Presentation (Web)**: страницы `/booking/*` с шагами service → slot → intake → consents → payment → confirmation + `/booking/no-slots`.
- **Presentation (API)**: новые public endpoints `POST /booking/start`, `POST /booking/{id}/intake`, `POST /booking/{id}/consents`, `GET /booking/{id}/status`, `POST /payments`, `POST /booking/webhook/yookassa`.
- **Application**: use cases `StartBookingUseCase`, `SubmitIntakeUseCase`, `UpdateBookingConsentsUseCase`, `GetBookingStatusUseCase`, `CreatePaymentUseCase`, `ConfirmAppointmentUseCase`.
- **Domain**: добавлен `IntakeForm`, репозиторий `IIntakeFormRepository`, расширены возможности `User` для управления согласиями, добавлен метод `updateStatus` в `Appointment`.
- **Infrastructure**: Prisma-репозиторий для intake, расширение appointment/slot репозиториев, реализация `EmailStub` и `YooKassaStub`, регистрация в `CommonModule`.

## Точки входа в коде
- Web flow: `apps/web/src/app/booking/*`
- API:
  - `apps/api/src/presentation/controllers/public/public.controller.ts`
  - `apps/api/src/application/booking/use-cases/*`
  - `apps/api/src/infrastructure/persistence/prisma/booking/*`

## Проверки и тесты
- E2E: `apps/web/e2e/booking.spec.ts`
- Запуск:
  - `cd apps/web && npm run e2e`

## Конфигурация
- Web: `NEXT_PUBLIC_API_URL`
- API: `ENCRYPTION_KEY`, `ENCRYPTION_KEY_ID`, `DATABASE_URL`

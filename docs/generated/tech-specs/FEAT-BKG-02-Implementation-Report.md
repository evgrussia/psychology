# FEAT-BKG-02 Implementation Report (Slices A–D)

## Scope
- Slice A: OAuth подключение Google Calendar из админки + безопасное хранение токенов.
- Slice B: импорт busy-интервалов и вычисление доступных слотов (без UI) + публичный API.
- Slice C: создание события в Google Calendar для подтверждённой записи.
- Slice D: фоновая синхронизация (polling) и кэширование доступности.

## Acceptance Criteria / DoD
- AC-1: Админ подключает календарь и видит статус интеграции.
- AC-2: UI выбора слота показывает доступные интервалы в таймзоне пользователя.
- AC-3: При подтверждении записи создаётся событие в GCal.
- AC-4: В случае конфликта запись не подтверждается, пользователь получает альтернативы (обеспечено атомарной резервацией слота и блокировкой busy-интервалов).
- DoD: слоты корректно строятся; события создаются/синхронизируются; деградации обработаны.

## Реализовано
- Data model:
  - Таблица `integrations_google_calendar` с OAuth полями и статусом.
  - Enum `GoogleCalendarIntegrationStatus` (disconnected/pending/connected/error).
  - Новые поля для состояния синка: `last_sync_at`, `last_sync_range_start_at`, `last_sync_range_end_at`, `last_sync_error`.
  - Уникальный индекс на `availability_slots` для защиты от дублей.
- Domain:
  - `GoogleCalendarIntegration` и репозиторий `IGoogleCalendarIntegrationRepository`.
  - Booking: `AvailabilitySlot`, `Appointment`, `TimeSlot`, репозитории слотов и встреч.
- Application:
  - `ConnectGoogleCalendarUseCase` (start + callback).
  - `GetGoogleCalendarStatusUseCase`.
  - `SyncCalendarBusyTimesUseCase` (freeBusy → blocked slots).
  - `CreateCalendarEventForAppointmentUseCase` (export booking → GCal).
  - `ListAvailableSlotsUseCase` (public API, фильтрация по busy).
  - `ReserveSlotForAppointmentUseCase` (атомарная резервация слота).
- Infrastructure:
  - OAuth клиент `GoogleCalendarOAuthService`.
  - Google Calendar API клиент `GoogleCalendarService` (freeBusy/events).
  - Фоновый планировщик `GoogleCalendarSyncScheduler` (polling).
  - `AesGcmEncryptionService` для P2‑шифрования токенов.
  - Prisma‑репозиторий интеграции.
  - Prisma‑репозитории слотов и встреч.
- Presentation:
  - API: `POST /api/admin/integrations/google-calendar/connect`,
    `GET /api/admin/integrations/google-calendar/callback`,
    `GET /api/admin/integrations/google-calendar/status`.
  - API: `POST /api/admin/integrations/google-calendar/sync`.
  - API: `GET /api/public/booking/slots`.
- Observability:
  - Логи старта/успеха/ошибок OAuth в use-case и OAuth сервисе.
  - Логи ошибок синка и экспорта событий.

## Основные точки входа
- API:
  - `apps/api/src/presentation/controllers/admin-google-calendar.controller.ts`
  - `apps/api/src/presentation/controllers/public/public.controller.ts`
- Application:
  - `apps/api/src/application/integrations/use-cases/ConnectGoogleCalendarUseCase.ts`
  - `apps/api/src/application/integrations/use-cases/GetGoogleCalendarStatusUseCase.ts`
  - `apps/api/src/application/integrations/use-cases/SyncCalendarBusyTimesUseCase.ts`
  - `apps/api/src/application/integrations/use-cases/CreateCalendarEventForAppointmentUseCase.ts`
  - `apps/api/src/application/booking/use-cases/ListAvailableSlotsUseCase.ts`
- Domain:
  - `apps/api/src/domain/integrations/entities/GoogleCalendarIntegration.ts`
  - `apps/api/src/domain/integrations/repositories/IGoogleCalendarIntegrationRepository.ts`
  - `apps/api/src/domain/booking/entities/AvailabilitySlot.ts`
  - `apps/api/src/domain/booking/entities/Appointment.ts`
- Persistence:
  - `apps/api/src/infrastructure/persistence/prisma/integrations/prisma-google-calendar-integration.repository.ts`
  - `apps/api/src/infrastructure/persistence/prisma/booking/prisma-availability-slot.repository.ts`
  - `apps/api/src/infrastructure/persistence/prisma/booking/prisma-appointment.repository.ts`
- Security:
  - `apps/api/src/infrastructure/security/encryption.service.ts`

## Тест-план и как запускать
- Unit:
  - `pnpm --filter @psychology/api test` (включая `ConnectGoogleCalendarUseCase.spec.ts` и `encryption.service.spec.ts`)
- Integration (mock GCal API):
  - `pnpm --filter @psychology/api test`:
    - `SyncCalendarBusyTimesUseCase.spec.ts`
    - `CreateCalendarEventForAppointmentUseCase.spec.ts`
    - `ListAvailableSlotsUseCase.spec.ts`

## Переменные окружения (без секретов)
- `ENCRYPTION_KEY_ID`, `ENCRYPTION_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`
- `GOOGLE_OAUTH_SCOPES` (опционально)
- `GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES` (опционально)
- `GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS` (опционально)

## Ограничения и блокеры
- Для live‑проверки OAuth нужны реальные Google OAuth credentials
  (`client_id`, `client_secret`, `redirect_uri`).
- Для live‑проверки freeBusy/создания событий нужны реальные Google API credentials и доступ к календарю.

## Примечания по приватности и безопасности
- OAuth токены хранятся в БД только в зашифрованном виде (AES‑GCM).
- В логах нет токенов; логируются только статусы и технические метки.

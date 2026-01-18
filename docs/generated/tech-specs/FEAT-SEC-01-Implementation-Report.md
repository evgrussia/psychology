# FEAT-SEC-01 Implementation Report

Проект: «Эмоциональный баланс»  
Спека: `docs/generated/tech-specs/FEAT-SEC-01.md`  
Дата: 2026-01-17  

## Что реализовано
- Раздельные согласия (ПДн/коммуникации/Telegram) записываются с версией/источником в booking/waitlist/cabinet.
- Добавлен API `/api/consents` для чтения/обновления согласий авторизованного клиента.
- Проверки consent_personal_data добавлены в PII-флоу: waitlist/booking intake.
- Отзыв communications останавливает email-уведомления (booking confirmation, waitlist confirmation).
- События `consent_updated` пишутся при изменениях в booking/waitlist/cabinet.

## Основные точки входа
- Consents API: `apps/api/src/presentation/controllers/consents.controller.ts`
- Обработка согласий в booking: `apps/api/src/application/booking/use-cases/UpdateBookingConsentsUseCase.ts`
- Waitlist + согласия: `apps/api/src/application/booking/use-cases/CreateWaitlistRequestUseCase.ts`
- Intake guard по consent_personal_data: `apps/api/src/application/booking/use-cases/SubmitIntakeUseCase.ts`
- Отключение email при revoke communications: `apps/api/src/application/booking/use-cases/ConfirmAppointmentAfterPaymentUseCase.ts`
- UI waitlist consent copy: `apps/web/src/app/booking/no-slots/NoSlotsClient.tsx`

## Тесты
- `pnpm -C apps/api test -- CreateWaitlistRequestUseCase.spec.ts`

## Блокеры / невыполнено
- Нет блокеров.

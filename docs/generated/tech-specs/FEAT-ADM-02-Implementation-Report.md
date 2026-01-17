# FEAT-ADM-02 — Implementation Report

Дата: 2026-01-17  
Статус: выполнено (e2e заблокирован локальной БД)

## Что реализовано (AC/DoD)
- **AC-1:** UI показывает статусы слотов `available/reserved/exception/buffer`, отдельно отображаются бронирования.
- **AC-2:** Исключения/буферы исключают пересекающиеся слоты из публичной availability.
- **DoD:** Психолог управляет расписанием и исключениями; изменения отражаются в слотовом API.

## Основные изменения в коде

### Backend (API)
- Новые эндпойнты админки:
  - `GET /api/admin/schedule/slots`
  - `POST /api/admin/schedule/slots`
  - `POST /api/admin/schedule/exceptions`
  - `POST /api/admin/schedule/buffers`
  - `PUT /api/admin/schedule/slots/:id`
  - `DELETE /api/admin/schedule/slots`
  - `GET /api/admin/schedule/appointments`
  - `POST /api/admin/schedule/appointments/:id/cancel`
  - `GET/PUT /api/admin/schedule/settings`
- Слоты получили типы блокировок (`exception`/`buffer`) и внутреннюю заметку.
- Публичный `GET /api/public/booking/slots` теперь учитывает блокировки из админки.
- Добавлены настройки расписания (timezone, buffer_minutes).

Ключевые файлы:
- `apps/api/src/presentation/controllers/admin-schedule.controller.ts`
- `apps/api/src/application/admin/use-cases/schedule/*`
- `apps/api/src/application/booking/use-cases/ListAvailableSlotsUseCase.ts`
- `apps/api/prisma/schema.prisma` и `apps/api/prisma/migrations/20260117120000_add_schedule_blocks_and_settings/migration.sql`

### Admin UI
- Раздел `/schedule` реализован: просмотр слотов/бронирований, создание слотов, исключений и буферов, массовое удаление, настройки расписания, запуск sync Google Calendar.

Ключевые файлы:
- `apps/admin/src/app/schedule/page.tsx`

## Как проверить

### API + e2e
1) Поднять тестовую инфраструктуру:
   - `pnpm test:infra:up`
2) Запустить e2e для расписания:
   - `pnpm --filter @psychology/api test:e2e --runInBand test/admin-schedule.e2e-spec.ts`

### Admin UI (ручная проверка)
1) Запустить API и админку.
2) Открыть `/admin/schedule`.
3) Создать слот и убедиться, что он появился в списке.
4) Создать исключение и убедиться, что слот пропал из публичного `/api/public/booking/slots`.

## Тесты
- Добавлен e2e тест `apps/api/test/admin-schedule.e2e-spec.ts`.

## Блокеры
- E2E тесты требуют PostgreSQL на `localhost:5433` (см. `pnpm test:infra:up`).

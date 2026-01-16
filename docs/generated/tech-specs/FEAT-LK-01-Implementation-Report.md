# FEAT-LK-01 Implementation Report

## Что реализовано (по AC/DoD)
- Доступ к кабинету защищён ролью `client` на уровне API (`/api/cabinet/*`).
- Встречи возвращаются только для текущего клиента (`client_user_id` фильтрация).
- Материалы привязаны к встречам и возвращаются только владельцу.
- Веб-кабинет показывает встречи и материалы, событие `lk_opened` отправляется на всех страницах кабинета.

## Основные точки входа
- API:
  - `apps/api/src/presentation/controllers/cabinet.controller.ts`
  - `apps/api/src/application/cabinet/use-cases/ListClientAppointmentsUseCase.ts`
  - `apps/api/src/application/cabinet/use-cases/ListClientMaterialsUseCase.ts`
  - `apps/api/src/infrastructure/cabinet/cabinet.module.ts`
- Web:
  - `apps/web/src/app/cabinet/page.tsx`
  - `apps/web/src/app/cabinet/appointments/page.tsx`
  - `apps/web/src/app/cabinet/materials/page.tsx`
  - `apps/web/src/app/login/page.tsx`

## Модель данных
- `AppointmentMaterial` + `AppointmentMaterialType` добавлены в `apps/api/prisma/schema.prisma`.

## Как проверить
- Убедиться, что `NEXT_PUBLIC_API_URL` указывает на API (например `http://127.0.0.1:3001/api`).
- Прогон e2e (web): `pnpm --filter @psychology/web e2e`.
- Для материалов потребуется запись в `appointment_materials` и связанный `appointment`.

## Что не сделано / блокеры
- **Web e2e**: `pnpm --filter @psychology/web e2e` упал из-за таймаута запуска webServer (Playwright). Нужна проверка конфигурации webServer или локальный запуск `pnpm --filter @psychology/web dev` перед тестом.
- Приватные материалы через прокси/подписанные ссылки — отдельная фича, вне scope FEAT-LK-01 (используются публичные URL медиа).


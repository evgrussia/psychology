# FEAT-BKG-01 Implementation Report

## Scope
- Public catalog of services and service details with cancellation/reschedule rules.
- Public API endpoints for listing services and getting a service by slug.
- Tracking on service page: `service_selected` and `booking_start`.
- Tests for domain rules, public use-cases, controller endpoints, and a11y/E2E.

## Acceptance Criteria / DoD
- AC-1 `/services/` показывает активные услуги.
- AC-2 `/services/{slug}/` доступна по slug и содержит правила.
- AC-3 CTA отправляет `booking_start` с `service_slug` (если известно).
- Негативные: slug не найден → 404.
- DoD: пользователь видит услуги и правила; данные корректны; всё покрыто тестами.

## Реализовано
- Backend:
  - Домен `Service` с правилами отмены/переноса и валидацией.
  - Prisma схема услуг расширена политиками и адресом офлайна.
  - Public API: `GET /public/services`, `GET /public/services/:slug`.
- Frontend:
  - Страницы `/services` и `/services/{slug}`.
  - Правила отмены/переноса отображаются на странице услуги.
  - CTA запускает `booking_start` с `service_slug`.
  - `service_selected` фиксируется на открытии страницы услуги.
- Данные:
  - Seed добавляет 3 услуги (включая `intro-session`).
- Тесты:
  - Unit: доменная валидация `Service`.
  - Application: use-cases для public services.
  - Integration: public controller endpoints.
  - E2E: список услуг, детальная страница и трекинг CTA, базовая a11y.

## Основные точки входа
- API:
  - `apps/api/src/presentation/controllers/public/public.controller.ts`
  - `apps/api/src/application/public/use-cases/ListServicesUseCase.ts`
  - `apps/api/src/application/public/use-cases/GetServiceBySlugUseCase.ts`
- Domain:
  - `apps/api/src/domain/booking/entities/Service.ts`
  - `apps/api/src/domain/booking/repositories/IServiceRepository.ts`
- Persistence:
  - `apps/api/src/infrastructure/persistence/prisma/booking/prisma-service.repository.ts`
- Web:
  - `apps/web/src/app/services/page.tsx`
  - `apps/web/src/app/services/[slug]/page.tsx`
  - `apps/web/src/app/services/[slug]/ServiceDetailClient.tsx`

## Тест-план и как запускать
- API unit/integration:
  - `pnpm --filter @psychology/api test`
- Web e2e:
  - `pnpm --filter @psychology/web test:e2e`

## Переменные окружения (без секретов)
- `NEXT_PUBLIC_API_URL` — base URL API для Web.
- `DATABASE_URL` — PostgreSQL для API.

## Ограничения и блокеры
- Блокеров нет.
- Полный booking-flow (`/booking`) остаётся за рамками FEAT-BKG-01 и реализуется в следующих фичах.

## Примечания по приватности и безопасности
- В трекинге не отправляются PII/чувствительные данные.

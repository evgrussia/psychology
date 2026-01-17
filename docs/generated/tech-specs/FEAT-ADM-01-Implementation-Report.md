# FEAT-ADM-01 — Implementation Report

Дата: 2026-01-17  
Статус: выполнено (с блокером по e2e окружению)

## Что реализовано (AC/DoD)
- **AC-1:** Дашборд доступен только `owner|assistant`, `editor` получает 403 (backend) и запрещён в UI.
- **AC-2:** Виджеты дашборда строятся по данным из БД/трекинга (best effort), с явными `null` при отсутствии данных.
- **DoD:** Админка защищена RBAC (через `/api/auth/me` + `AdminAuthGuard`) и имеет базовый дашборд/навигацию.

## Основные изменения в коде

### Backend (API)
- `GET /api/admin/dashboard?range=...` — агрегирует метрики из БД:
  - Воронка записи (`lead_timeline_events`)
  - Telegram (подписки/активность/stop rate)
  - Интерактивы (top-3 по стартам)
  - Встречи (предстоящие, завершённые, no-show best effort)
  - Модерация (очередь/среднее время/алерты)
  - Выручка (GMV/AOV/дельта)
- Трекинг `admin_login` через обработчик доменного события (без PII).

Ключевые файлы:
- `apps/api/src/application/admin/use-cases/GetAdminDashboardUseCase.ts`
- `apps/api/src/presentation/controllers/admin.controller.ts`
- `apps/api/src/infrastructure/tracking/admin-auth-tracking.handler.ts`
- `apps/api/src/infrastructure/tracking/tracking.service.ts`

### Admin UI
- Desktop-only guard (<768px сообщение)
- RBAC-guard на уровне layout и доп. ограничение дашборда
- Базовый дашборд `/` с фильтром периодов и быстрыми ссылками
- Навигация по IA с фильтрацией по ролям
- Страница логина `/login`
- Плейсхолдеры для ключевых разделов админки

Ключевые файлы:
- `apps/admin/src/components/admin-layout-client-wrapper.tsx`
- `apps/admin/src/components/admin-auth-context.tsx`
- `apps/admin/src/components/admin-auth-guard.tsx`
- `apps/admin/src/components/desktop-only-guard.tsx`
- `apps/admin/src/app/page.tsx`
- `apps/admin/src/app/login/page.tsx`
- `apps/admin/src/app/*/page.tsx` (плейсхолдеры разделов)

## Как проверить

### API
1) Поднять тестовую инфраструктуру:
   - `pnpm test:infra:up`
2) Запустить e2e:
   - `pnpm test:api:e2e`

### Admin UI (ручная проверка)
1) Запустить API и админку.
2) Залогиниться под `owner`.
3) Открыть `/` и убедиться, что видны виджеты дашборда и навигация.
4) Проверить, что роль `editor` получает запрет на дашборд.

## Тесты
- Добавлены e2e тесты RBAC для `/api/admin/dashboard`.
- Запуск `pnpm test:api:e2e` **падает**, если не поднят PostgreSQL на `localhost:5433`.

## Блокеры
- Для e2e требуется тестовая БД: `postgres` на `localhost:5433` (см. `pnpm test:infra:up`).

## Примечания
- Данные дашборда строятся best effort на текущей схеме БД и трекинге. Если событий нет, возвращаются `null`/`0`.

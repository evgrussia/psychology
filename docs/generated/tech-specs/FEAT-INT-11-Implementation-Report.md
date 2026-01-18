# FEAT-INT-11 Implementation Report

Дата: 2026-01-17  
Статус: ✅ выполнено

## Что реализовано
- Добавлен визуальный редактор NAV-01 в админке (ReactFlow) с отображением узлов и связей.
- Реализован валидатор структуры навигатора (без циклов, достижимость, корректные ссылки) и проверка из админки.
- Добавлено редактирование структуры: добавление шагов, управление вариантами и связями между шагами/профилями.
- Реализованы версии интерактива, diff между черновиком и опубликованной версией, безопасная публикация.
- Введено хранение черновика и опубликованной версии отдельно (draft/published JSON).

## Соответствие AC/DoD
- **Визуальный редактор**: структура NAV отображается графом, редактируется безопасно через draft.
- **Безопасность сценариев**: опубликованная версия не меняется до публикации; валидатор блокирует ошибки структуры.
- **DoD**: правки структуры не ломают текущие пользовательские сценарии.

## Ключевые изменения в коде
- UI редактора: `apps/admin/src/app/interactive/navigator/[id]/page.tsx`, список: `apps/admin/src/app/interactive/navigator/page.tsx`.
- API интерактивов: `apps/api/src/presentation/controllers/admin-interactive.controller.ts`.
- Use cases: `apps/api/src/application/admin/use-cases/interactive/*`.
- Версионирование интерактивов: `apps/api/src/infrastructure/persistence/prisma/interactive/prisma-interactive-definition.repository.ts`.
- Схема БД и миграция: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20260117_add_interactive_definition_versions/migration.sql`.

## Как проверить
1. Открыть `/admin/interactive/navigator`, перейти в редактор NAV.
2. Убедиться, что отображается граф шагов и связей; выбрать узел и отредактировать текст/связи.
3. Нажать «Проверить валидность» и убедиться, что ошибки отображаются корректно.
4. Сохранить черновик, затем опубликовать и проверить, что появилась версия в блоке «Версии».

## Тесты
- `pnpm --filter @psychology/admin typecheck`
- `pnpm --filter @psychology/api prisma:generate`
- `pnpm --filter @psychology/api typecheck`

## Примечания
- Для применения схемы БД нужна миграция Prisma.

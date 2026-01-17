# FEAT-ADM-03 Implementation Report

## Scope
- Реализовано редактирование интерактивов для `FEAT-INT-02/04/05`: квизы, скрипты границ, мини-ритуалы.
- Добавлены проверки валидности при сохранении и публикации.
- Реализованы превью draft/published и аудит действий.

## Acceptance Criteria / DoD
- **AC-1 Валидация definition при публикации**: проверка порогов квизов, графа навигатора, матрицы скриптов и шагов ритуала.
- **AC-2 Превью draft/published**: добавлен admin preview endpoint и переключатель версии в UI.
- **AC-3 RBAC owner/editor**: API эндпойнты защищены ролями owner/editor.
- **DoD (аудит/логирование)**: добавлены audit-log события для update/publish.

## Key Changes
### Backend
- `apps/api/src/presentation/controllers/admin-interactive.controller.ts`
  - добавлены preview endpoints (`/definitions/:id/preview` и shortcut `/admin/interactive/:id/preview`)
  - добавлен shortcut `/admin/interactive/:id/publish`
  - передача контекста пользователя для аудита
- `apps/api/src/application/admin/use-cases/interactive/UpdateInteractiveDefinitionUseCase.ts`
  - валидации для `boundaries` и `ritual`
  - аудит `admin_interactive_updated`
- `apps/api/src/application/admin/use-cases/interactive/PublishInteractiveDefinitionUseCase.ts`
  - валидации для `boundaries` и `ritual`
  - аудит `admin_interactive_published`
- `apps/api/src/application/audit/dto/audit-log.dto.ts`
  - новые действия аудита

### Admin UI
- `apps/admin/src/app/interactive/page.tsx` — навигация по интерактивам.
- `apps/admin/src/app/interactive/quizzes/*` — исправлены API вызовы + превью версий.
- `apps/admin/src/app/interactive/boundaries/*` — список и редактор матрицы скриптов.
- `apps/admin/src/app/interactive/rituals/*` — список и редактор ритуалов.

## API Endpoints
- `GET /api/admin/interactive/definitions?type=...`
- `GET /api/admin/interactive/definitions/:id`
- `PUT /api/admin/interactive/definitions/:id`
- `POST /api/admin/interactive/definitions/:id/publish`
- `GET /api/admin/interactive/definitions/:id/preview?version=draft|published`
- `POST /api/admin/interactive/:id/publish` (shortcut)
- `GET /api/admin/interactive/:id/preview?version=...` (shortcut)

## Tests
- `apps/api/test/admin-interactive.e2e-spec.ts`
  - обновление порогов квиза → публикация → доступен updated config
  - проверка audit-log для update/publish

## How to verify
- Admin UI:
  - `/interactive/quizzes`, `/interactive/boundaries`, `/interactive/rituals`
  - Отредактировать → сохранить → превью (draft/published) → опубликовать
- API:
  - `PUT /api/admin/interactive/definitions/:id`
  - `POST /api/admin/interactive/definitions/:id/publish`
  - `GET /api/public/interactive/quizzes/:slug`

## Notes / Limitations
- История версий интерактивов пока не хранится; превью использует текущую сохранённую definition.
- Ассистент не имеет доступа к редактированию интерактивов (RBAC owner/editor по техспеке).

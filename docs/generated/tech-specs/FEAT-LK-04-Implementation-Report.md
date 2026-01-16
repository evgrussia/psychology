# FEAT-LK-04 Implementation Report

## Что реализовано (по AC/DoD)
- Экспорт данных аккаунта в JSON/ZIP через кабинет, без сохранения содержимого на сервере и без утечек в логи.
- Самостоятельное удаление аккаунта: статус `deleted`, закрытие сессий, очистка чувствительных данных, отвязка Telegram-сессий.
- Отзыв согласий на коммуникации и Telegram с фиксацией событий `consent_updated`.
- Событие `account_deleted` отправляется с `method=self_service`.
- Действия по экспорту и удалению фиксируются в аудит‑логе (без содержимого данных).

## Основные точки входа
- API:
  - `apps/api/src/presentation/controllers/cabinet.controller.ts`
  - `apps/api/src/application/cabinet/use-cases/ExportAccountDataUseCase.ts`
  - `apps/api/src/application/cabinet/use-cases/UpdateCabinetConsentsUseCase.ts`
  - `apps/api/src/application/cabinet/use-cases/DeleteAccountUseCase.ts`
  - `apps/api/src/infrastructure/cabinet/account-data-exporter.service.ts`
  - `apps/api/src/infrastructure/cabinet/account-cleanup.service.ts`
  - `apps/api/src/infrastructure/tracking/tracking.service.ts`
- Web:
  - `apps/web/src/app/cabinet/settings/page.tsx`
  - `apps/web/src/app/cabinet/cabinetApi.ts`
  - `apps/web/src/app/cabinet/CabinetPageLayout.tsx`

## Модель данных
- Используются существующие таблицы `users`, `consents`, `diary_entries`, `intake_forms`, `anonymous_questions`, `question_answers`, `reviews`, `waitlist_requests`, `lead_identities`.
- Для удаления аккаунта применяется `users.status=deleted` и `users.deleted_at`.

## Как проверить
- API интеграционные тесты: `pnpm --filter @psychology/api test -- AccountSettings.integration.spec.ts`
- Веб: открыть `/cabinet/settings`, изменить согласия, скачать экспорт, удалить аккаунт и убедиться, что сессия закрыта.

## Что не сделано / блокеры
- Блокеров нет.

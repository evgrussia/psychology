# FEAT-AN-11 Implementation Report

Дата: 2026-01-17  
Статус: ✅ выполнено

## Что реализовано
- Добавлена детальная аналитика квизов: события `quiz_question_completed` (question_index) и `quiz_abandoned` (abandoned_at_question) без текстов/ответов.
- Расширен трекинг навигатора: `navigator_step_completed` включает `run_id`, сохраняется `choice_id` и `step_index`.
- Новый API для детализации интерактивов: `/api/admin/analytics/interactive`.
- Новый экран админки `/analytics/interactive` с воронкой, вопросами и распределениями выборов.
- Обновлена защита privacy: безопасные ключи `question_index`, `question_count`, `abandoned_at_question` разрешены в timeline.

## Соответствие AC/DoD
- **Воронка по вопросам/шагам**: квизы считают прохождение вопросов и абандон по индексам; навигатор — шаги и распределение `choice_id`.
- **Без PII/текстов**: события передают только ID/индексы и агрегаты; тексты не трекаются.
- **Верификация корректности данных**: добавлен e2e-тест интерактивной аналитики.

## Ключевые изменения в коде
- Трекинг интерактивов и новые события: `apps/web/src/lib/interactive.ts`, `apps/web/src/app/start/quizzes/[slug]/QuizClient.tsx`, `apps/web/src/app/start/navigator/[slug]/NavigatorClient.tsx`.
- API детализации: `apps/api/src/application/admin/use-cases/analytics/GetAdminInteractiveDetailsUseCase.ts`, контроллер `apps/api/src/presentation/controllers/admin-analytics.controller.ts`.
- UI админки: `apps/admin/src/app/analytics/interactive/page.tsx` и ссылка в `apps/admin/src/app/analytics/page.tsx`.
- Privacy фильтрация timeline: `apps/api/src/application/crm/use-cases/CreateOrUpdateLeadUseCase.ts`.
- Документирование новых событий: `docs/Tracking-Plan.md`.

## Как проверить
1. Открыть `/admin/analytics/interactive` в админке.
2. Убедиться, что отображаются:
   - funnel интерактивов,
   - прохождение вопросов квиза (question_index),
   - абандон на вопросах (abandoned_at_question),
   - распределение выборов в навигаторе по `choice_id`.

## Тесты
- `pnpm --filter @psychology/api test:e2e --runInBand test/analytics-ingest.e2e-spec.ts`

## Примечания
- Новые события не содержат текстов и не нарушают privacy правила из `docs/Tracking-Plan.md`.

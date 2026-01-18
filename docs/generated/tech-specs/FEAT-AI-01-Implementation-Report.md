# FEAT-AI-01 — Implementation Report

## Scope
Feature: AI‑агенты (navigation next step + concierge booking) с жёсткими safety/guardrails, кризис‑режимом и минимизацией данных.

## Источники
- `docs/generated/tech-specs/FEAT-AI-01.md`
- `docs/PRD.md`
- `docs/research/09-AI-Agents-Safety.md`
- `docs/research/10-Legal-Privacy-Compliance-RU.md`
- `docs/research/01-IA-and-UserJourneys.md`

## Acceptance Criteria / DoD (из спеки и связанных документов)
- AI не ставит диагнозы и не даёт медицинских назначений.
- Кризисный режим перекрывает ответы и направляет к экстренной помощи.
- Ответы — только навигация/сервис, без терапии в чате.
- Не принимаем чувствительный текст без отдельного согласия.
- Логи/события не содержат PII/свободный текст.
- Реализованы только разрешённые сценарии; безопасность и приватность подтверждены тестами.

## Реализация по этапам (slices)

### Stage A — Safety layer + crisis classifier + redaction + eval harness
- Добавлена доменная политика безопасности `AiSafetyPolicy` с классификацией кризиса и запретами на диагноз/лекарства/терапию.
- Реализованы стандартизированные кризис/отказ ответы (без хранения текста).
- Добавлены тесты безопасности (юнит + e2e).

Ключевые точки:
- `apps/api/src/domain/ai/services/AiSafetyPolicy.ts`
- `apps/api/src/application/ai/helpers/ai-responses.ts`
- `apps/api/src/domain/ai/services/__tests__/AiSafetyPolicy.spec.ts`
- `apps/api/test/ai-agent.e2e-spec.ts`

### Stage B — Агент-навигация «следующий шаг» (без хранения текста)
- Публичный API `POST /public/ai/next-step` с жёстким safety‑фильтром.
- UI `/ai/next-step`: 5–7 структурированных вопросов, без обязательного текста, явные согласия.
- Рекомендации собираются по темам и контенту (статьи/ресурсы), без хранения ответов.

Ключевые точки:
- `apps/api/src/application/ai/use-cases/GetAiNextStepUseCase.ts`
- `apps/api/src/presentation/controllers/public/ai.controller.ts`
- `apps/web/src/app/ai/next-step/AiNextStepClient.tsx`
- `apps/web/src/lib/ai.ts`

### Stage C — Агент-консьерж записи (только сервисные ответы + human handoff)
- Публичный API `POST /public/ai/concierge` с ограничением на сервисный сценарий.
- UI `/ai/concierge`: подбор формата/цели/срочности, переход к записи, Telegram handoff.

Ключевые точки:
- `apps/api/src/application/ai/use-cases/GetAiConciergeUseCase.ts`
- `apps/web/src/app/ai/concierge/AiConciergeClient.tsx`

## Безопасность и приватность
- Явное подтверждение 18+.
- Свободный текст опционален и доступен только при отдельном согласии.
- В ответах и трекинге нет PII/свободного текста; события — только агрегаты.
- Кризисный режим имеет отдельные действия и не содержит пользовательских деталей.

## Тесты
Запускалось локально:
- `apps/api/src/domain/ai/services/__tests__/AiSafetyPolicy.spec.ts`
- `apps/api/test/ai-agent.e2e-spec.ts`

## Как проверить вручную
1. Открыть `/ai/next-step`, ответить на вопросы и получить рекомендации.
2. Ввести кризисный текст с согласием → отобразится экстренный блок.
3. Открыть `/ai/concierge`, выбрать формат и цель → получить рекомендацию услуги.
4. Убедиться, что без согласия на текст запрос отклоняется.

## Зависимости
- Контент и темы берутся из существующих репозиториев (`IContentItemRepository`, `ITopicRepository`).
- Услуги — из `IServiceRepository`.
- Telegram deep links — через `createTelegramDeepLink` на веб‑стороне.

## Блокеры
Нет.

## Примечания
- Реализация использует безопасные эвристики (без LLM/диагностики).
- Добавлены новые публичные AI‑эндпойнты без хранения текстов и с кризис‑перекрытием.

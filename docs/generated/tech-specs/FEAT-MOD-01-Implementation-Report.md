# FEAT-MOD-01 — Implementation Report

**Дата:** 2026-01-17  
**Статус:** done  

## Что реализовано (AC/DoD)
- **AC-1:** Текст вопроса хранится только в шифрованном виде (`question_text_encrypted`, `contact_value_encrypted`).
- **AC-2:** Аналитика не содержит текста вопроса — `question_submitted` отправляется без текста, в трекинге включён PII-фильтр.
- **AC-3:** Контакт опционален и отправляется только при явном согласии пользователя.
- **DoD:** Пользователь может отправить вопрос; он проходит безопасную пред-проверку (PII/кризис); текст не попадает в аналитику.

## Основные точки входа
- Backend use case: `apps/api/src/application/public/use-cases/SubmitAnonymousQuestionUseCase.ts`
- Public API: `apps/api/src/presentation/controllers/public/ugc.controller.ts`
- Public UI: `apps/web/src/app/interactive/anonymous-question/AnonymousQuestionClient.tsx`
- Routing: `apps/web/src/app/interactive/anonymous-question/page.tsx`
- Seed безопасных шаблонов ответов: `apps/api/prisma/seed.ts`

## Guardrails и безопасность
- **PII-фильтр** в форме: предупреждение + авто-маскирование.
- **Кризисные флаги**: показываем экстренную помощь; для высокого риска требуется подтверждение безопасности.
- **Безопасные шаблоны ответов**: добавлены дефолтные шаблоны в seed для модераторов.

## Трекинг
- `question_submitted` — `channel=web`, `has_contact` (без текста).
- `crisis_banner_shown` — фиксируется при обнаружении кризисных триггеров.

## Тесты
- E2E: `apps/api/test/ugc.e2e-spec.ts`
  - submit → ciphertext в БД;
  - запись появляется в очереди модерации.

Команда:
- `pnpm --filter @psychology/api test:e2e -- test/ugc.e2e-spec.ts`

## Что не сделано / блокеры
- Блокеров нет.

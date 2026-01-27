# Commands (конвенции чата)

Cursor не требует отдельной регистрации команд: мы используем **префиксы в сообщениях** (см. `.cursor/rules/00-agentic-system-core.mdc`).

## Базовые команды системы

| Команда | Описание | Справка |
|---------|----------|---------|
| `/start-project <идея>` | Начать новый проект | `start-project.md` |
| `/status` | Показать текущее состояние | `status.md` |
| `/route <agent> <task>` | Выполнить в роли агента | `route.md` |
| `/checkpoint` | Создать checkpoint | `checkpoint.md` |
| `/summary` | Сгенерировать summary | `summary.md` |

## Команды проекта «Эмоциональный баланс»

| Команда | Описание | Справка |
|---------|----------|---------|
| `/domain <bounded-context>` | Показать спецификацию доменного контекста | `domain.md` |
| `/phase <N>` | Показать техспеку фазы разработки | `phase.md` |
| `/interactive <module-id>` | Показать спецификацию интерактива | `interactive.md` |
| `/tone-check` | Проверить текст на бережный тон | `tone-check.md` |
| `/crisis-check` | Проверить кризисную обработку | `crisis-check.md` |

## Примеры использования

```bash
# Базовые
/status
/route coder реализуй Booking aggregate
/checkpoint

# Project-specific
/domain booking
/phase 2
/interactive QZ-01
/tone-check
/crisis-check src/components/QuizResult.tsx
```

## Файлы в папке

Каждый файл — подсказка по входу/выходу команды и ожидаемым артефактам.


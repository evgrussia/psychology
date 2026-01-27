# Skills (навыки)

Тексты навыков хранятся в директориях с файлом `SKILL.md` в `.cursor/skills/*/SKILL.md`.

## Общие навыки

| Навык | Описание | Путь |
|-------|----------|------|
| `web-research` | Поиск и синтез информации из интернета | `.cursor/skills/web-research/SKILL.md` |
| `document-generator` | Генерация документации (README, API docs, guides) | `.cursor/skills/document-generator/SKILL.md` |
| `image-generator` | Генерация графики (иллюстрации, иконки, баннеры) | `.cursor/skills/image-generator/SKILL.md` |
| `context-manager` | Управление контекстом, summaries, checkpoints | `.cursor/skills/context-manager/SKILL.md` |
| `verification-engine` | Проверка соответствия спецификациям | `.cursor/skills/verification-engine/SKILL.md` |
| `langchain-development` | Паттерны AI-агентов на LangChain/LangGraph | `.cursor/skills/langchain-development/SKILL.md` |

## Навыки проекта «Эмоциональный баланс»

| Навык | Описание | Путь |
|-------|----------|------|
| `crisis-safety-check` | Проверка кризисной обработки (КРИТИЧНО) | `.cursor/skills/crisis-safety-check/SKILL.md` |
| `django-ddd-patterns` | Паттерны Django + Clean Architecture + DDD | `.cursor/skills/django-ddd-patterns/SKILL.md` |
| `tone-voice-validator` | Проверка бережного тона контента | `.cursor/skills/tone-voice-validator/SKILL.md` |

## Когда применять (краткая справка)

```yaml
crisis-safety-check:
  trigger: "интерактивы, результаты тестов, контент о ментальном здоровье"
  critical: true
  
django-ddd-patterns:
  trigger: "реализация domain entities, use cases, repositories, API"
  
tone-voice-validator:
  trigger: "UI copy, статьи, email-шаблоны, CTA"
  
context-manager:
  trigger: "создание summary, checkpoint, управление контекстом"
  
verification-engine:
  trigger: "code review, проверка соответствия спекам"
  
langchain-development:
  trigger: "AI-агенты, LangChain/LangGraph код"
```


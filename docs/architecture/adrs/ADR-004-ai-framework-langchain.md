# ADR-004: AI Framework — LangChain/LangGraph

## Status
Accepted

## Date
2026-01-26

## Context
Требуется выбор фреймворка для разработки AI-агентов. Сценарии использования:
- Агент-навигация (подбор следующего шага)
- Агент-консьерж записи (помощь в выборе услуги/слота)
- Агент-контент-редактор (генерация черновиков)
- Агент-аналитик тем (анализ анонимной статистики)

Требования:
- Безопасность и guardrails
- Human-in-the-loop паттерны
- Мульти-агентная оркестрация
- Интеграция с Django (Python-экосистема)

## Decision
Использовать **LangChain/LangGraph** для AI-агентов.

## Consequences

### Positive
- Python-экосистема (совместимость с Django)
- Безопасность и guardrails встроены
- Human-in-the-loop паттерны поддерживаются
- Мульти-агентная оркестрация через LangGraph
- Активное сообщество и документация
- Интеграция с различными LLM провайдерами

### Negative
- Быстро развивающаяся библиотека (возможны breaking changes)
- Требуется понимание паттернов LangChain/LangGraph

### Neutral
- Стандартный выбор для Python-проектов с AI

## Alternatives Considered

### Option 1: OpenAI Assistants API
- **Description:** Управляемые ассистенты от OpenAI
- **Pros:** Простота использования, встроенная оркестрация
- **Cons:** Привязка к OpenAI, меньше контроля, сложнее кастомизация
- **Why not:** Нужна гибкость и независимость от провайдера LLM

### Option 2: Собственная реализация
- **Description:** Прямые вызовы к LLM API
- **Pros:** Полный контроль
- **Cons:** Нужно реализовывать guardrails, оркестрацию, инструменты самостоятельно
- **Why not:** LangChain предоставляет готовые паттерны и инструменты

## References
- `docs/research/09-AI-Agents-Safety.md` — требования безопасности AI-агентов
- `docs/Technical-Decisions.md` — раздел 4
- `.cursor/skills/langchain-development/SKILL.md` — паттерны разработки

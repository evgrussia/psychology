# ADR-001: Backend Framework — Django

## Status
Accepted

## Date
2026-01-26

## Context
Требуется выбор backend-фреймворка для проекта «Эмоциональный баланс». Проект должен поддерживать:
- REST API для frontend
- Интеграции с внешними сервисами (Telegram, ЮKassa, Google Calendar)
- Админ-панель для управления контентом и CRM
- AI-агенты на LangChain/LangGraph
- Работу с PostgreSQL
- Clean Architecture + DDD подход

## Decision
Использовать **Django** как backend-фреймворк.

## Consequences

### Positive
- Явное требование заказчика выполнено
- Django ORM для работы с PostgreSQL
- Встроенная админ-панель (база для кастомной админки)
- Django REST Framework для REST API
- Система миграций БД
- Django Signals для событий (или отдельный Event Bus)
- Middleware для обработки запросов, логирования, безопасности
- Хорошая интеграция с Python-экосистемой (LangChain, Telegram библиотеки)

### Negative
- Нужно адаптировать Django под Clean Architecture + DDD (не стандартный подход)
- Требуется дисциплина в разделении слоёв (Domain без Django-зависимостей)

### Neutral
- Django используется в контексте Clean Architecture, где Domain Layer — чистый Python

## Alternatives Considered

### Option 1: FastAPI
- **Description:** Современный async Python-фреймворк
- **Pros:** Высокая производительность, автоматическая документация OpenAPI, async/await
- **Cons:** Нет встроенной админки, меньше готовых решений, не соответствует требованию заказчика
- **Why not:** Не соответствует явному требованию использовать Django

### Option 2: Flask
- **Description:** Минималистичный Python-фреймворк
- **Pros:** Гибкость, простота
- **Cons:** Нужно собирать всё самостоятельно (ORM, админка, миграции), не соответствует требованию
- **Why not:** Не соответствует требованию заказчика

## References
- `docs/Technical-Decisions.md` — раздел 1
- `docs/Архитектурный-обзор.md` — архитектурные принципы
- `docs/Domain-Model-Specification.md` — применение DDD

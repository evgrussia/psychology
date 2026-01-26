# ADR-002: Architecture Pattern — Clean Architecture + DDD

## Status
Accepted

## Date
2026-01-26

## Context
Требуется выбрать архитектурный паттерн для проекта, который обеспечит:
- Разделение ответственности
- Тестируемость
- Независимость от фреймворков
- Масштабируемость
- Поддержку сложной бизнес-логики (booking, payments, interactive modules)

## Decision
Использовать **Clean Architecture + Domain-Driven Design (DDD)** как основу архитектуры.

## Consequences

### Positive
- Чёткое разделение слоёв (Domain, Application, Infrastructure, Presentation)
- Domain Layer независим от Django и внешних библиотек
- Высокая тестируемость (Domain и Use Cases тестируются без БД/фреймворка)
- Масштабируемость через Bounded Contexts
- Явная бизнес-логика в Domain Layer
- Легкая замена инфраструктурных компонентов (БД, внешние сервисы)

### Negative
- Больше кода и абстракций (Repository interfaces, Mappers)
- Требуется дисциплина в соблюдении зависимостей
- Кривая обучения для команды (если не знакомы с DDD)

### Neutral
- Django используется как Infrastructure/Presentation слой, Domain остаётся чистым Python

## Alternatives Considered

### Option 1: Django MVC (стандартный подход)
- **Description:** Стандартная структура Django (models, views, templates)
- **Pros:** Простота, быстрое начало, стандартный подход
- **Cons:** Бизнес-логика смешивается с ORM, сложно тестировать, зависимость от Django
- **Why not:** Не обеспечивает необходимую гибкость и тестируемость для сложной бизнес-логики

### Option 2: Microservices
- **Description:** Разделение на отдельные сервисы
- **Pros:** Независимое масштабирование, изоляция
- **Cons:** Избыточно для MVP, сложность оркестрации, overhead на коммуникацию
- **Why not:** Проект начинается как монолит, microservices можно добавить позже при необходимости

## References
- `docs/Domain-Model-Specification.md` — детальная доменная модель
- `docs/Архитектурный-обзор.md` — архитектурные принципы
- `docs/Technical-Decisions.md` — раздел 9

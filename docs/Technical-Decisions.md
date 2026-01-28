# Технические решения — «Эмоциональный баланс»

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Назначение:** фиксация ключевых технических решений проекта, включая выбор технологий, паттернов и подходов.

---

## 1) Backend Framework: Django

### Решение
**Backend на Django** (требование зафиксировано).

### Обоснование
- Явное требование пользователя/заказчика
- Django предоставляет:
  - ORM для работы с БД (PostgreSQL)
  - Админ-панель (может быть использована как база для кастомной админки)
  - Система аутентификации и авторизации
  - Middleware для обработки запросов
  - REST framework (Django REST Framework) для API
  - Миграции БД
  - Система сигналов для событий

### Архитектурные принципы
Django используется в контексте **Clean Architecture + DDD**:

```
┌─────────────────────────────────────┐
│  Presentation Layer                 │
│  - Django Views / DRF ViewSets      │
│  - Serializers (DTOs)               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Application Layer (Use Cases)       │
│  - Django Apps как Use Cases        │
│  - Service classes                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Domain Layer                       │
│  - Entities, Value Objects          │
│  - Domain Services                  │
│  - Domain Events                    │
│  - Repository Interfaces            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Infrastructure Layer               │
│  - Django ORM (Repository impl)     │
│  - External Services (Telegram,     │
│    ЮKassa, Google Calendar)         │
│  - Event Bus / Message Queue        │
└─────────────────────────────────────┘
```

### Структура Django-проекта

```
backend/
├── config/                    # Django settings
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   └── wsgi.py
│
├── domain/                     # Domain Layer (DDD)
│   ├── booking/
│   │   ├── entities.py
│   │   ├── value_objects.py
│   │   ├── domain_services.py
│   │   ├── domain_events.py
│   │   └── repositories.py     # Interfaces
│   ├── interactive/
│   ├── content/
│   └── ...
│
├── application/                 # Application Layer (Use Cases)
│   ├── booking/
│   │   ├── use_cases.py
│   │   └── dto.py
│   ├── interactive/
│   └── ...
│
├── infrastructure/             # Infrastructure Layer
│   ├── persistence/
│   │   ├── django_models.py    # Django ORM models
│   │   └── repositories.py     # Repository implementations
│   ├── external/
│   │   ├── telegram/
│   │   ├── payments/
│   │   └── calendar/
│   └── events/
│
├── presentation/               # Presentation Layer
│   ├── api/
│   │   ├── v1/
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   └── ...
│   └── admin/                  # Custom admin (опционально)
│
└── shared/                     # Shared Kernel
    ├── exceptions.py
    ├── validators.py
    └── utils.py
```

### Django Apps как Bounded Contexts

Каждый bounded context может быть реализован как Django app:

- `booking` — запись на консультацию
- `interactive` — интерактивы (квизы, дневники)
- `content` — контент и SEO
- `payments` — оплата
- `identity` — пользователи и согласия
- `client_cabinet` — личный кабинет
- `admin_panel` — админ-панель
- `telegram` — интеграция с Telegram
- `moderation` — модерация UGC
- `analytics` — аналитика

### Ключевые Django-компоненты

1. **Django ORM** — для persistence layer (реализация Repository pattern)
2. **Django REST Framework** — для REST API
3. **Django Signals** — для Domain Events (или использовать отдельный Event Bus)
4. **Django Admin** — как база для кастомной админки (или полностью кастомная)
5. **Django Migrations** — для управления схемой БД
6. **Django Middleware** — для обработки запросов, логирования, безопасности

### Интеграции

- **LangChain/LangGraph** — Python-библиотеки, легко интегрируются с Django
- **PostgreSQL** — нативная поддержка через Django ORM
- **Telegram Bot API** — через `python-telegram-bot` или `aiogram`
- **ЮKassa** — через HTTP-клиент (requests/httpx)
- **Google Calendar API** — через официальный Python SDK

---

## 2) Frontend

### Статус
**Удалён.** Проект backend-only (Django REST API).

---

## 3) Database: PostgreSQL

### Решение
**PostgreSQL** как основная БД.

### Обоснование
- Надёжность и ACID-транзакции
- JSONB для гибкого хранения (метаданные, конфигурации)
- Полная поддержка в Django ORM
- Масштабируемость
- Расширения (PostGIS при необходимости)

---

## 4) AI Framework: LangChain/LangGraph

### Решение
**LangChain/LangGraph** для AI-агентов.

### Обоснование
- Python-экосистема (совместимость с Django)
- Безопасность и guardrails
- Human-in-the-loop паттерны
- Мульти-агентная оркестрация (LangGraph)

### Сценарии использования
1. **Агент-навигация** — подбор следующего шага
2. **Агент-консьерж записи** — помощь в выборе услуги/слота
3. **Агент-контент-редактор** — генерация черновиков постов
4. **Агент-аналитик тем** — анализ анонимной статистики

---

## 5) Payment Provider: ЮKassa

### Решение
**ЮKassa** для приёма платежей.

### Обоснование
- Популярный провайдер в РФ
- Webhooks для статусов
- Поддержка депозитов и полной оплаты
- Документация и SDK

---

## 6) Calendar Integration: Google Calendar

### Решение
**Google Calendar API** для синхронизации расписания.

### Обоснование
- Широкое использование
- API для чтения/записи событий
- Синхронизация в реальном времени
- Интеграция с Django через Python SDK

---

## 7) Messaging: Telegram Bot API

### Решение
**Telegram Bot API** для бота и канала.

### Обоснование
- Основной канал догрева и удержания
- Deep links для склейки аналитики
- Удобство для пользователей
- Python-библиотеки (`python-telegram-bot`, `aiogram`)

---

## 8) Analytics: TBD

### Статус
**TBD** (event-based, без PII)

### Требования
- Event-based tracking
- Без передачи PII/чувствительных данных
- Склейка Web ↔ Telegram через `deep_link_id`
- См. `docs/Tracking-Plan.md`

### Решение ожидается
Требуется выбор инструмента аналитики.

---

## 9) Architecture Pattern: Clean Architecture + DDD

### Решение
**Clean Architecture + DDD** как основа архитектуры.

### Обоснование
- Разделение ответственности
- Тестируемость
- Независимость от фреймворков
- Масштабируемость
- См. `docs/Domain-Model-Specification.md`

### Применение в Django
- Domain Layer — чистый Python (без Django-зависимостей)
- Application Layer — Use Cases (минимальные зависимости)
- Infrastructure Layer — Django ORM, внешние сервисы
- Presentation Layer — Django Views, DRF ViewSets

---

## 10) Testing Strategy

### Решение
Многоуровневое тестирование:
- **Unit tests** — Domain Layer, Use Cases
- **Integration tests** — Repository implementations, API endpoints
- **E2E tests** — ключевые пользовательские сценарии
- **Smoke tests** — проверка работоспособности после деплоя

### Инструменты
- **pytest** — для unit/integration тестов
- **pytest-django** — для Django-специфичных тестов
- **pytest-cov** — для покрытия кода
- **Playwright/Selenium** — для E2E тестов (опционально)

---

## 11) CI/CD: TBD

### Статус
**TBD**

### Требования
- Автоматические тесты
- Автоматический деплой
- Миграции БД
- Мониторинг

### Решение ожидается
Требуется настройка CI/CD pipeline.

---

## Открытые вопросы

1. ✅ **Backend framework** — решено: Django
2. ✅ **Frontend** — удалён (backend-only)
3. ✅ **Database** — решено: PostgreSQL
4. ✅ **AI framework** — решено: LangChain/LangGraph
5. ✅ **Payment provider** — решено: ЮKassa
6. ✅ **Calendar integration** — решено: Google Calendar
7. ✅ **Messaging** — решено: Telegram Bot API
8. ⏳ **Analytics** — ожидается решение
9. ✅ **Architecture pattern** — решено: Clean Architecture + DDD
10. ⏳ **CI/CD** — ожидается настройка

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Backend решение зафиксировано (Django)

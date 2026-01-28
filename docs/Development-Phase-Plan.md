# План стадии Development — «Эмоциональный баланс»

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** В работе  
**Основано на:** Roadmap-Backlog.md, Архитектурный-обзор.md, Domain-Model-Specification.md, Design-Handoff.md

---

## 1) Цель стадии Development

Реализовать Release 1 продукта согласно PRD, Roadmap и архитектурным спецификациям, обеспечив:
- Полное покрытие всех P0 фич из Roadmap
- Соответствие Clean Architecture + DDD принципам
- Интеграцию готового Design System
- Готовность к запуску (Go Live)

---

## 2) Входные артефакты (из предыдущих фаз)

✅ **Готовы:**
- `docs/PRD.md` — требования продукта
- `docs/Roadmap-Backlog.md` — план фич и эпиков
- `docs/Архитектурный-обзор.md` — системная архитектура
- `docs/Domain-Model-Specification.md` — доменная модель (DDD)
- `docs/Модель-данных.md` — физическая схема БД
- `docs/Technical-Decisions.md` — технические решения
- `docs/Design-Handoff.md` — готовый дизайн
- `design_system/` — готовые компоненты и экраны
- `docs/api/api-contracts.md` — контракты API
- `docs/Tracking-Plan.md` — план аналитики

---

## 3) Технологический стек (подтверждён)

### Backend
- **Framework:** Django (требование зафиксировано)
- **Database:** PostgreSQL
- **Architecture:** Clean Architecture + DDD
- **API:** Django REST Framework
- **Testing:** pytest + pytest-django

### Frontend
- **Статус:** удалён. Проект backend-only.

### Интеграции
- **Payments:** ЮKassa
- **Calendar:** Google Calendar API
- **Messaging:** Telegram Bot API
- **AI:** LangChain/LangGraph (Release 2)

### Инфраструктура
- **CI/CD:** TBD (настроить)
- **Analytics:** TBD (event-based, без PII)

---

## 4) Структура проекта (Clean Architecture + DDD)

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
│   ├── payments/
│   ├── identity/
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

# frontend/ удалён (backend-only)
```

---

## 5) План работ (по эпикам из Roadmap)

### Phase 1: Platform & Foundations (EPIC-00)
**Цель:** Создать базовую инфраструктуру проекта

**Задачи:**
1. ✅ Настройка Django-проекта со структурой Clean Architecture
2. ✅ Настройка PostgreSQL + миграции по `docs/Модель-данных.md`
3. ✅ RBAC система (owner/assistant/editor/client) + сессии
4. ✅ Медиа-статика (локальное хранилище + `/media/*`)
5. ✅ Аудит-лог критичных действий
6. ✅ CI/CD pipeline (базовая настройка)
7. ✅ Окружения dev/stage/prod

**Выходные артефакты:**
- Работающий Django-проект
- База данных с миграциями
- Система аутентификации и авторизации
- CI/CD pipeline

**Оценка:** L (2-4 недели)

---

### Phase 2: Domain Layer Implementation (EPIC-00 продолжение)
**Цель:** Реализовать доменную модель согласно DDD

**Задачи:**
1. ✅ Реализация Aggregate Roots и Entities
2. ✅ Value Objects
3. ✅ Domain Services
4. ✅ Domain Events
5. ✅ Repository Interfaces

**Домены (по приоритету):**
1. Identity & Access
2. Booking
3. Payments
4. Interactive
5. Content
6. Client Cabinet
7. UGC Moderation
8. Telegram Integration
9. Analytics

**Выходные артефакты:**
- Реализованные доменные модели
- Интерфейсы репозиториев
- Доменные события

**Оценка:** XL (1+ месяц, параллельно с Infrastructure)

---

### Phase 3: Infrastructure Layer Implementation
**Цель:** Реализовать инфраструктурный слой

**Задачи:**
1. ✅ Django ORM модели (реализация Repository pattern)
2. ✅ Репозитории (реализация интерфейсов из Domain)
3. ✅ Интеграции:
   - ЮKassa (payments)
   - Google Calendar (booking)
   - Telegram Bot API
   - Email (уведомления)
4. ✅ Event Bus для Domain Events

**Выходные артефакты:**
- Работающие репозитории
- Интеграции с внешними сервисами
- Event Bus

**Оценка:** XL (1+ месяц, параллельно с Domain)

---

### Phase 4: Application Layer (Use Cases)
**Цель:** Реализовать бизнес-логику в виде Use Cases

**Задачи:**
1. ✅ Use Cases для Booking
2. ✅ Use Cases для Payments
3. ✅ Use Cases для Interactive
4. ✅ Use Cases для Content
5. ✅ Use Cases для Client Cabinet
6. ✅ Use Cases для Admin Panel
7. ✅ Use Cases для UGC Moderation
8. ✅ Use Cases для Telegram Integration

**Выходные артефакты:**
- Реализованные Use Cases
- DTOs для передачи данных

**Оценка:** XL (1+ месяц)

---

### Phase 5: Presentation Layer (API)
**Цель:** Реализовать REST API

**Задачи:**
1. ✅ Django REST Framework настройка
2. ✅ API endpoints для всех доменов
3. ✅ Serializers (DTOs)
4. ✅ Аутентификация и авторизация API
5. ✅ Валидация запросов
6. ✅ Обработка ошибок

**Выходные артефакты:**
- REST API v1
- Документация API (Swagger/OpenAPI)

**Оценка:** L (2-4 недели)

---

### Phase 6: Frontend Integration **(удалена)**
**Статус:** Frontend удалён. Проект backend-only. Спека `Phase-6-Frontend-Integration.md` удалена.

---

### Phase 7: Integration & Testing
**Цель:** Интеграция всех компонентов и тестирование

**Задачи:**
1. ✅ Интеграционное тестирование
2. ✅ E2E тестирование ключевых сценариев
3. ✅ Нагрузочное тестирование
4. ✅ Безопасность (security audit)
5. ✅ Доступность (A11y проверка)
6. ✅ Исправление багов

**Выходные артефакты:**
- Протестированная система
- Отчёты о тестировании
- Исправленные баги

**Оценка:** L (2-4 недели)

---

### Phase 8: Deployment & Go Live
**Цель:** Подготовка к запуску

**Задачи:**
1. ✅ Настройка production окружения
2. ✅ Миграции БД в production
3. ✅ Настройка мониторинга и алертов
4. ✅ Документация для пользователей
5. ✅ Документация для поддержки
6. ✅ Smoke tests после деплоя
7. ✅ Go Live

**Выходные артефакты:**
- Работающий production
- Мониторинг
- Документация

**Оценка:** M (1 неделя)

---

## 6) Последовательность реализации (приоритеты)

### Sprint 1-2: Foundations
- EPIC-00: Platform & Foundations
- Начало Domain Layer (Identity & Access)

### Sprint 3-4: Core Booking
- Domain Layer: Booking, Payments
- Infrastructure: Repositories, Integrations
- Application: Booking Use Cases
- Presentation: Booking API

### Sprint 5-6: Interactive & Content
- Domain Layer: Interactive, Content
- Application: Interactive, Content Use Cases
- Presentation: Interactive, Content API

### Sprint 7-8: Client Cabinet & Admin
- Domain Layer: Client Cabinet, Admin
- Application: Client Cabinet, Admin Use Cases
- Presentation: Client Cabinet, Admin API

### Sprint 9-10: Telegram & UGC
- Domain Layer: Telegram, UGC Moderation
- Application: Telegram, UGC Use Cases
- Presentation: Telegram, UGC API

### Sprint 11-12: ~~Frontend~~ (удалена)
- Frontend удалён; backend-only.

### Sprint 13-14: Testing & Polish
- Integration Testing
- E2E Testing
- Bug Fixes
- Security & A11y

### Sprint 15: Deployment
- Production Setup
- Go Live

---

## 7) Критерии готовности (Definition of Done)

### Для каждой фичи:
- ✅ Код реализован согласно Clean Architecture + DDD
- ✅ Unit тесты написаны (покрытие ≥80%)
- ✅ Integration тесты написаны
- ✅ Code review пройден
- ✅ Документация обновлена
- ✅ Нет критичных багов

### Для каждого эпика:
- ✅ Все фичи реализованы
- ✅ E2E тесты ключевых сценариев проходят
- ✅ Performance требования выполнены
- ✅ Security требования выполнены
- ✅ A11y требования выполнены (WCAG 2.2 AA)

### Для Release 1:
- ✅ Все P0 фичи реализованы
- ✅ Все тесты проходят
- ✅ Production окружение настроено
- ✅ Мониторинг работает
- ✅ Документация готова
- ✅ Go Live approval получен

---

## 8) Риски и митигация

### Риск 1: Сложность интеграции Design System
**Митигация:** Ранняя интеграция, тестирование на простых экранах

### Риск 2: Задержки в интеграциях (ЮKassa, Google Calendar, Telegram)
**Митигация:** Раннее начало интеграций, mock-реализации для разработки

### Риск 3: Производительность при большом объёме данных
**Митигация:** Раннее нагрузочное тестирование, оптимизация запросов

### Риск 4: Безопасность и приватность (152-ФЗ)
**Митигация:** Ранний security audit, проверка compliance

### Риск 5: Недостаточное покрытие тестами
**Митигация:** TDD подход, CI проверка покрытия

---

## 9) Метрики прогресса

### Технические метрики:
- Покрытие тестами: ≥80%
- Количество критичных багов: 0
- Performance: время ответа API <200ms (p95)
- Security: 0 критичных уязвимостей

### Продуктовые метрики:
- Реализовано фич: X из Y (P0)
- Готовность к Go Live: X%

---

## 10) Следующие шаги

1. ✅ Начать Phase 1: Platform & Foundations
2. ✅ Создать структуру Django-проекта
3. ✅ Настроить базу данных
4. ✅ Реализовать Domain Layer (Identity & Access)
5. ✅ Настроить CI/CD

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ План готов, начинаем Phase 1

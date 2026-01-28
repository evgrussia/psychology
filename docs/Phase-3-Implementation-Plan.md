# Phase 3: Infrastructure Layer — План реализации

**Дата создания:** 2026-01-27  
**Статус:** В работе  
**Orchestrator:** Планирование и распределение задач

---

## Обзор

Реализация Infrastructure Layer согласно спецификации `docs/Phase-3-Infrastructure-Technical-Specs.md`.

### Текущее состояние

✅ **Готово:**
- Domain Layer (Phase 2) — интерфейсы репозиториев готовы
- Базовая структура `infrastructure/` существует
- Пример реализации: `DjangoUserRepository` для Identity

❌ **Требуется реализация:**
- Django ORM модели для всех доменов
- Mappers для всех доменов
- Репозитории для всех доменов
- Event Bus
- Интеграции с внешними сервисами
- EncryptionService

---

## Декомпозиция задач

### Этап 1: Django ORM модели (Persistence Layer)

**Приоритет:** Высокий  
**Агент:** Coder Agent  
**Оценка:** 1 неделя

**Задачи:**
1. Создать Django ORM модели для всех доменов:
   - `booking.py` — Appointment, Service, Payment, IntakeForm
   - `interactive.py` — InteractiveRun, InteractiveDefinition
   - `identity.py` — User, Consent, Role (частично есть)
   - `content.py` — ContentItem, Topic, Tag
   - `payments.py` — Payment (если отдельный контекст)
   - `client_cabinet.py` — DiaryEntry, DataExportRequest
   - `telegram.py` — DeepLink
   - `crm.py` — Lead, LeadIdentity, LeadTimelineEvent
   - `moderation.py` — ModerationItem, Question, Answer
   - `admin.py` — AuditLog, MessageTemplate

2. Настроить индексы и constraints
3. Создать миграции Django

**Выходные артефакты:**
- `backend/infrastructure/persistence/django_models/*.py`
- Миграции в `backend/infrastructure/persistence/migrations/`

---

### Этап 2: Mappers (Domain ↔ DB)

**Приоритет:** Высокий  
**Агент:** Coder Agent  
**Оценка:** 3-5 дней

**Задачи:**
1. Создать Mapper классы для всех доменов:
   - `booking_mapper.py` — AppointmentMapper
   - `interactive_mapper.py` — InteractiveRunMapper
   - `identity_mapper.py` — UserMapper (частично есть)
   - `content_mapper.py` — ContentMapper
   - И т.д.

2. Реализовать методы:
   - `to_domain()` — DB Record → Domain Entity
   - `to_persistence()` — Domain Entity → DB Record

**Выходные артефакты:**
- `backend/infrastructure/persistence/mappers/*.py`

---

### Этап 3: Репозитории (Repository Pattern)

**Приоритет:** Высокий  
**Агент:** Coder Agent  
**Оценка:** 2 недели

**Задачи:**
1. Реализовать репозитории для всех доменов (по приоритету):
   - **Booking:** AppointmentRepository, ServiceRepository, WaitlistRepository
   - **Identity:** UserRepository (есть, проверить полноту)
   - **Payments:** PaymentRepository
   - **Interactive:** InteractiveRunRepository, InteractiveDefinitionRepository
   - **Content:** ContentRepository
   - **Client Cabinet:** DiaryRepository
   - **CRM:** LeadRepository
   - **Moderation:** ModerationRepository
   - **Telegram:** DeepLinkRepository
   - **Analytics:** EventRepository

2. Интегрировать с Event Bus для публикации Domain Events
3. Реализовать обработку транзакций

**Выходные артефакты:**
- `backend/infrastructure/persistence/repositories/**/*.py`

---

### Этап 4: Event Bus

**Приоритет:** Средний  
**Агент:** Coder Agent  
**Оценка:** 3-5 дней

**Задачи:**
1. Реализовать `IEventBus` интерфейс
2. Реализовать `InMemoryEventBus` (для Release 1)
3. Настроить регистрацию обработчиков событий
4. Интегрировать с репозиториями

**Выходные артефакты:**
- `backend/infrastructure/events/event_bus.py`
- `backend/infrastructure/events/in_memory_event_bus.py`
- `backend/infrastructure/events/event_handlers.py`

---

### Этап 5: Интеграции с внешними сервисами

**Приоритет:** Средний  
**Агент:** Coder Agent  
**Оценка:** 2-3 недели

**Задачи:**
1. **ЮKassa (Payments):**
   - `YooKassaClient` — HTTP клиент
   - `YooKassaAdapter` — Anti-Corruption Layer
   - `YooKassaWebhookHandler` — обработчик webhooks

2. **Google Calendar:**
   - `GoogleCalendarClient` — API клиент
   - `GoogleCalendarAdapter` — Anti-Corruption Layer

3. **Telegram Bot API:**
   - `TelegramBotClient` — HTTP клиент
   - `TelegramAdapter` — адаптер

4. **Email:**
   - `EmailClient` — SMTP клиент
   - `EmailService` — сервис отправки

**Выходные артефакты:**
- `backend/infrastructure/external/payments/*.py`
- `backend/infrastructure/external/calendar/*.py`
- `backend/infrastructure/external/telegram/*.py`
- `backend/infrastructure/external/email/*.py`

---

### Этап 6: EncryptionService (P2 данные)

**Приоритет:** Высокий (для безопасности)  
**Агент:** Coder Agent  
**Оценка:** 2-3 дня

**Задачи:**
1. Реализовать `IEncryptionService` интерфейс
2. Реализовать `FernetEncryptionService` (через cryptography.fernet)
3. Интегрировать с репозиториями для шифрования P2 данных

**Выходные артефакты:**
- `backend/infrastructure/encryption/encryption_service.py`
- `backend/infrastructure/encryption/fernet_encryption.py`

---

### Этап 7: Review и проверка реализации

**Приоритет:** Высокий  
**Агент:** Review Agent  
**Оценка:** 3-5 дней

**Задачи:**
1. Проверить соответствие спецификации Phase-3
2. Проверить качество кода
3. Проверить покрытие тестами
4. Создать Verification Report

**Выходные артефакты:**
- `docs/verification/Phase-3-Infrastructure-Verification-Report.md`

---

### Этап 8: Тестирование

**Приоритет:** Высокий  
**Агент:** QA Agent  
**Оценка:** 1-2 недели

**Задачи:**
1. Создать unit тесты для всех компонентов
2. Создать integration тесты для репозиториев
3. Создать integration тесты для интеграций (с моками)
4. Запустить все тесты и добиться зеленых прогонов
5. Добиться покрытия ≥80%

**Выходные артефакты:**
- `backend/tests/infrastructure/persistence/**/*.py`
- `backend/tests/infrastructure/external/**/*.py`
- `backend/tests/infrastructure/events/**/*.py`
- `backend/tests/infrastructure/encryption/**/*.py`

---

## Последовательность выполнения

```
Этап 1 (Django ORM модели)
    ↓
Этап 2 (Mappers)
    ↓
Этап 3 (Репозитории)
    ↓
Этап 4 (Event Bus) ──┐
    ↓                 │
Этап 5 (Интеграции)   │ (можно параллельно)
    ↓                 │
Этап 6 (Encryption) ──┘
    ↓
Этап 7 (Review)
    ↓
Этап 8 (Тестирование)
```

---

## Критерии готовности (Definition of Done)

### Для каждого компонента:
- ✅ Код реализован согласно Clean Architecture + DDD
- ✅ Unit тесты написаны (покрытие ≥80%)
- ✅ Integration тесты написаны (для интеграций)
- ✅ Code review пройден
- ✅ Документация обновлена (docstrings)
- ✅ Нет критичных багов

### Для Phase 3 в целом:
- ✅ Все репозитории реализованы и протестированы
- ✅ Все интеграции реализованы и протестированы
- ✅ Event Bus работает и интегрирован
- ✅ Шифрование P2 данных работает
- ✅ Миграции БД применены
- ✅ Все тесты проходят (≥80% покрытие)
- ✅ Документация готова

---

## Распределение задач по агентам

### Coder Agent
- Этап 1: Django ORM модели
- Этап 2: Mappers
- Этап 3: Репозитории
- Этап 4: Event Bus
- Этап 5: Интеграции
- Этап 6: EncryptionService

### Review Agent
- Этап 7: Review и проверка реализации

### QA Agent
- Этап 8: Тестирование

---

## Зависимости

- **Phase 2 (Domain Layer)** должна быть завершена ✅
- **Phase 1 (Platform & Foundations)** должна быть завершена ✅

---

## Риски и митигация

1. **Сложность маппинга Domain ↔ DB**
   - Митигация: Раннее создание Mapper классов, тестирование на простых случаях

2. **Задержки в интеграциях**
   - Митигация: Раннее начало интеграций, mock-реализации для разработки

3. **Производительность репозиториев**
   - Митигация: Оптимизация запросов, использование индексов

4. **Безопасность шифрования**
   - Митигация: Использование проверенных библиотек (Fernet), правильное управление ключами

---

*Документ создан: Orchestrator Agent (planning)*

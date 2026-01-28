# Задача: Исправление и верификация API Endpoints

**Приоритет:** Критический  
**Статус:** В работе  
**Агент:** Coder Agent

## Контекст

Согласно Verification Report Phase 5, endpoints реализованы на 67%, но есть критические проблемы:

1. **Отсутствуют тесты** (покрытие ~5%)
2. **Возможные нарушения Clean Architecture**
3. **Необходима проверка работоспособности всех endpoints**

## Проблемы из Verification Report

### Critical (Must Fix) 🔴

#### C-001: Отсутствуют тесты для Presentation Layer
- **Location:** `backend/tests/presentation/`
- **Remediation:** Создать unit и integration тесты для всех ViewSets и Serializers
- **Spec Reference:** `docs/api/Phase5-Presentation-Layer-API-Specification.md:1917-1994`

**Missing Test Files:**
- `backend/tests/presentation/api/v1/serializers/test_auth.py`
- `backend/tests/presentation/api/v1/serializers/test_booking.py`
- `backend/tests/presentation/api/v1/views/test_auth.py`
- `backend/tests/presentation/api/v1/views/test_booking.py`
- `backend/tests/presentation/api/v1/views/test_interactive.py`
- `backend/tests/presentation/api/v1/views/test_content.py`
- `backend/tests/presentation/api/v1/views/test_cabinet.py`
- `backend/tests/presentation/api/v1/views/test_webhooks.py`
- `backend/tests/presentation/api/v1/views/test_admin.py`
- `backend/tests/presentation/api/v1/views/test_moderation.py`
- `backend/tests/presentation/api/v1/views/test_payments.py`

#### C-002: Нарушение Clean Architecture в auth.py
- **Location:** `backend/presentation/api/v1/views/auth.py:90,151`
- **Issue:** Использование `get_django_model()` через репозиторий для JWT токенов
- **Remediation:** Рассмотреть альтернативный подход (возможно, это допустимо, но нужно проверить)

#### C-003: Нарушение Clean Architecture в booking.py
- **Location:** `backend/presentation/api/v1/views/booking.py:477`
- **Issue:** Возможно прямое обращение к ORM (нужно проверить)
- **Remediation:** Использовать Repository

### High (Should Fix) 🟠

#### H-001: Валидация подписи ЮKassa
- **Location:** `backend/presentation/api/v1/views/webhooks.py:94-98`
- **Issue:** Валидация подписи пропускается в development
- **Remediation:** Документировать поведение или использовать флаг DEBUG

## Задачи

### 1. Проверка работоспособности endpoints

Проверить все endpoints из спецификации:

**Auth:**
- [ ] POST /api/v1/auth/register
- [ ] POST /api/v1/auth/login
- [ ] POST /api/v1/auth/refresh
- [ ] POST /api/v1/auth/logout

**Booking:**
- [ ] GET /api/v1/booking/services
- [ ] GET /api/v1/booking/services/:id
- [ ] GET /api/v1/booking/services/:id/slots
- [ ] POST /api/v1/booking/appointments
- [ ] GET /api/v1/booking/appointments/:id

**Interactive:**
- [ ] GET /api/v1/interactive/quizzes
- [ ] POST /api/v1/interactive/quizzes/:slug/start
- [ ] POST /api/v1/interactive/quizzes/:slug/submit
- [ ] GET /api/v1/interactive/diaries
- [ ] POST /api/v1/interactive/diaries

**Content:**
- [ ] GET /api/v1/content/articles
- [ ] GET /api/v1/content/articles/:slug
- [ ] GET /api/v1/content/resources
- [ ] GET /api/v1/content/resources/:slug

**Cabinet:**
- [ ] GET /api/v1/cabinet/appointments
- [ ] GET /api/v1/cabinet/diaries
- [ ] POST /api/v1/cabinet/data/export
- [ ] DELETE /api/v1/cabinet/data/delete

**Payments:**
- [ ] GET /api/v1/payments

**Webhooks:**
- [ ] POST /api/v1/webhooks/yookassa
- [ ] POST /api/v1/webhooks/telegram

**Admin:**
- [ ] GET /api/v1/admin/appointments
- [ ] GET /api/v1/admin/leads
- [ ] GET /api/v1/admin/content
- [ ] GET /api/v1/admin/moderation

**Moderation:**
- [ ] POST /api/v1/moderation/questions

### 2. Исправление архитектурных проблем

- [ ] Проверить использование `get_django_model()` в auth.py - возможно, это допустимо для JWT
- [ ] Проверить booking.py на прямое обращение к ORM
- [ ] Исправить найденные проблемы

### 3. Создание базовых тестов

**Приоритет 1 (критичные endpoints):**
- [ ] Тесты для auth endpoints (register, login, refresh, logout)
- [ ] Тесты для booking endpoints (services, appointments)
- [ ] Тесты для payments endpoints

**Приоритет 2:**
- [ ] Тесты для interactive endpoints
- [ ] Тесты для content endpoints
- [ ] Тесты для cabinet endpoints

**Приоритет 3:**
- [ ] Тесты для admin endpoints
- [ ] Тесты для moderation endpoints
- [ ] Тесты для webhooks

**Тесты для Serializers:**
- [ ] Тесты для auth serializers
- [ ] Тесты для booking serializers
- [ ] Тесты для других serializers

## Спецификация

- **API Spec:** `docs/api/Phase5-Presentation-Layer-API-Specification.md`
- **Verification Report:** `docs/verification/Phase-5-Presentation-Layer-Verification-Report.md`
- **Code Conventions:** Следовать Clean Architecture + DDD паттернам

## Ожидаемый результат

1. Все endpoints работают корректно
2. Архитектурные проблемы исправлены
3. Базовые тесты созданы (минимум для критичных endpoints)
4. Покрытие тестами увеличено до минимум 30-40%

## Deliverables

- Исправленный код в `backend/presentation/api/v1/views/`
- Тесты в `backend/tests/presentation/api/v1/`
- Отчет о найденных и исправленных проблемах

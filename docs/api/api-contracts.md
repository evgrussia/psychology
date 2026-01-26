# API Contracts: «Эмоциональный баланс»

**Версия:** 1.0  
**Дата:** 2026-01-26  
**API Style:** REST  
**Base URL:** `https://api.[domain].com/v1`  
**Content-Type:** `application/json`  
**Authentication:** Bearer token (JWT)

---

## 1) Overview

Этот документ описывает REST API для проекта «Эмоциональный баланс». API используется для:
- Публичного контента (статьи, ресурсы, интерактивы)
- Записи на консультации (booking)
- Личного кабинета клиента
- Админ-панели
- Интеграций (webhooks)

---

## 2) Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes* | `Bearer {token}` |
| `Content-Type` | Yes | `application/json` |
| `X-Request-ID` | No | Request tracing ID (UUID) |
| `Accept` | No | `application/json` |

*Except public endpoints

---

## 3) Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |
| 503 | Service Unavailable |

---

## 4) Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` — ошибка валидации входных данных
- `UNAUTHORIZED` — требуется авторизация
- `FORBIDDEN` — недостаточно прав
- `NOT_FOUND` — ресурс не найден
- `CONFLICT` — конфликт (например, слот уже занят)
- `RATE_LIMIT_EXCEEDED` — превышен лимит запросов
- `INTERNAL_ERROR` — внутренняя ошибка сервера

---

## 5) Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 req | 1 min |
| Auth endpoints | 10 req | 1 min |
| Authenticated | 1000 req | 1 min |
| Admin | 5000 req | 1 min |

**Response headers:**
- `X-RateLimit-Limit`: лимит запросов
- `X-RateLimit-Remaining`: оставшиеся запросы
- `X-RateLimit-Reset`: время сброса лимита (Unix timestamp)

---

## 6) Authentication Endpoints

### POST /auth/register
Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "display_name": "Иван Иванов",
  "consents": {
    "personal_data": true,
    "communications": false
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Иван Иванов"
  },
  "token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token"
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 400 | Invalid input |
| 409 | Email already exists |

---

### POST /auth/login
Авторизация пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Иван Иванов"
  },
  "token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token"
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 401 | Invalid credentials |
| 429 | Too many attempts |

---

### POST /auth/refresh
Обновление access token.

**Request:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_access_token"
}
```

---

### POST /auth/logout
Выход из системы (инвалидация токена).

**Request:** (empty body)

**Response (204):** No content

---

## 7) Content Endpoints

### GET /content/articles
Список статей блога.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 20 | Items per page (max 100) |
| category | string | - | Filter by category |
| tag | string | - | Filter by tag |
| search | string | - | Search query |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "article-slug",
      "title": "Article Title",
      "excerpt": "Short excerpt",
      "published_at": "2026-01-26T10:00:00Z",
      "category": "anxiety",
      "tags": ["tag1", "tag2"]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

### GET /content/articles/:slug
Получить статью по slug.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "slug": "article-slug",
    "title": "Article Title",
    "content": "Markdown content",
    "published_at": "2026-01-26T10:00:00Z",
    "category": "anxiety",
    "tags": ["tag1", "tag2"]
  }
}
```

---

### GET /content/resources
Список ресурсов (упражнения, аудио, чек-листы).

**Query Parameters:** (аналогично articles)

**Response (200):** (аналогично articles)

---

## 8) Interactive Endpoints

### GET /interactive/quizzes
Список доступных квизов.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "anxiety-quiz",
      "title": "Квиз по тревоге",
      "description": "Short description",
      "estimated_time_minutes": 5
    }
  ]
}
```

---

### POST /interactive/quizzes/:slug/start
Начать прохождение квиза.

**Request:** (empty body)

**Response (201):**
```json
{
  "run_id": "uuid",
  "quiz": {
    "id": "uuid",
    "slug": "anxiety-quiz",
    "title": "Квиз по тревоге"
  },
  "questions": [
    {
      "id": "uuid",
      "text": "Question text",
      "type": "multiple_choice",
      "options": ["Option 1", "Option 2"]
    }
  ]
}
```

---

### POST /interactive/quizzes/:slug/submit
Отправить ответы квиза.

**Request:**
```json
{
  "run_id": "uuid",
  "answers": [
    {
      "question_id": "uuid",
      "value": "answer_value"
    }
  ]
}
```

**Response (200):**
```json
{
  "run_id": "uuid",
  "result": {
    "level": "moderate",
    "profile": "anxiety_profile",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "deep_link_id": "base62_id" // для склейки аналитики
}
```

**Note:** Не сохраняем сырые ответы, только агрегаты (privacy by design).

---

### GET /interactive/diaries
Список записей дневника (только для авторизованного пользователя).

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "emotion",
      "content": "Diary entry content",
      "created_at": "2026-01-26T10:00:00Z"
    }
  ]
}
```

---

### POST /interactive/diaries
Создать запись дневника.

**Request:**
```json
{
  "type": "emotion",
  "content": "Diary entry content"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "type": "emotion",
    "content": "Diary entry content",
    "created_at": "2026-01-26T10:00:00Z"
  }
}
```

---

## 9) Booking Endpoints

### GET /booking/services
Список доступных услуг.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "consultation-online",
      "title": "Консультация онлайн",
      "description": "Service description",
      "duration_minutes": 60,
      "price_amount": 5000,
      "deposit_amount": 2000,
      "format": "online"
    }
  ]
}
```

---

### GET /booking/services/:id/slots
Получить доступные слоты для услуги.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| date_from | ISO8601 | Начало периода |
| date_to | ISO8601 | Конец периода |
| timezone | string | Таймзона пользователя (например, "Europe/Moscow") |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "start_at": "2026-01-27T10:00:00Z",
      "end_at": "2026-01-27T11:00:00Z",
      "status": "available"
    }
  ]
}
```

---

### POST /booking/appointments
Создать бронирование.

**Request:**
```json
{
  "service_id": "uuid",
  "slot_id": "uuid",
  "intake_form": {
    "question_1": "answer_1",
    "question_2": "answer_2"
  },
  "consents": {
    "personal_data": true,
    "communications": true
  }
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "service": {
      "id": "uuid",
      "title": "Консультация онлайн"
    },
    "slot": {
      "id": "uuid",
      "start_at": "2026-01-27T10:00:00Z"
    },
    "status": "pending_payment",
    "payment": {
      "id": "uuid",
      "amount": 5000,
      "deposit_amount": 2000,
      "payment_url": "https://yookassa.ru/..."
    }
  }
}
```

---

### GET /booking/appointments/:id
Получить информацию о бронировании.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "service": {
      "id": "uuid",
      "title": "Консультация онлайн"
    },
    "slot": {
      "id": "uuid",
      "start_at": "2026-01-27T10:00:00Z"
    },
    "status": "confirmed",
    "payment": {
      "id": "uuid",
      "status": "paid",
      "amount": 5000
    }
  }
}
```

---

## 10) Payments Endpoints

### POST /payments/:id/confirm
Подтверждение платежа (вызывается после webhook от ЮKassa).

**Note:** Этот endpoint используется внутренне, не для внешних клиентов.

---

### Webhook: POST /webhooks/yookassa
Webhook от ЮKassa для статусов платежей.

**Request:** (формат ЮKassa)

**Response (200):** (подтверждение получения)

**Note:** Валидация подписи обязательна, обработка идемпотентна.

---

## 11) Client Cabinet Endpoints

### GET /cabinet/appointments
Список встреч клиента.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "service": {
        "title": "Консультация онлайн"
      },
      "slot": {
        "start_at": "2026-01-27T10:00:00Z"
      },
      "status": "confirmed"
    }
  ]
}
```

---

### GET /cabinet/diaries
Список записей дневника (см. Interactive Endpoints).

---

### POST /cabinet/diaries/export
Экспорт дневников в PDF.

**Request:**
```json
{
  "date_from": "2026-01-01",
  "date_to": "2026-01-26",
  "format": "pdf"
}
```

**Response (202):**
```json
{
  "export_id": "uuid",
  "status": "processing",
  "download_url": null
}
```

**Note:** Экспорт выполняется асинхронно, статус можно проверить через GET /cabinet/diaries/exports/:id

---

### DELETE /cabinet/data
Удаление всех данных пользователя (GDPR/152-ФЗ).

**Request:** (empty body)

**Response (204):** No content

---

## 12) Admin Endpoints

### GET /admin/appointments
Список всех бронирований (для админа).

**Query Parameters:** (аналогично другим спискам + фильтры по статусу, дате)

---

### GET /admin/leads
Список лидов (CRM).

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "source": "booking_start",
      "status": "new",
      "timeline_events": [
        {
          "type": "interactive_completed",
          "timestamp": "2026-01-26T10:00:00Z"
        }
      ]
    }
  ]
}
```

**Note:** Timeline events не содержат чувствительных текстов (только типы событий).

---

## 13) References

- `docs/Модель-данных.md` — модель данных
- `docs/Domain-Model-Specification.md` — доменная модель
- `docs/security/security-requirements.md` — требования безопасности
- `docs/Архитектурный-обзор.md` — архитектура системы

---

## 14) OpenAPI Specification

Детальная OpenAPI спецификация будет создана в `docs/api/openapi.yaml` (опционально, для Release 1).

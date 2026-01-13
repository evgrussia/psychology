# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-PAY-01`  
**Epic:** `EPIC-05`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Интегрируем ЮKassa: создание платежа (депозит/полная оплата) для записи, выдача redirect/confirmation данных фронтенду, сохранение минимальных payment метаданных в БД.

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-PAY-1..3)
- Архитектура: `docs/Архитектурный-обзор.md` (payments truth on backend)
- Tracking: `docs/Tracking-Plan.md` (`payment_started`)

---

## 2) Goals
- создать payment intent в YooKassa с `idempotency_key`,
- связать payment с appointment,
- вернуть фронту данные для оплаты (redirect/url/widget).

Non-goals: refunds (если не требуется), альтернативные провайдеры.

---

## 3) AC / Негативные
- [ ] AC-1 Повторный запрос с тем же idempotency_key не создаёт дубль.
- [ ] AC-2 В БД не храним платёжные реквизиты, только provider ids/статус/сумму.
- **NS:** ошибка провайдера → бережный retry, логирование.

---

## 5) Архитектура
- **Application:** `CreatePaymentIntentUseCase`.
- **Domain:** `Payment` (supporting domain) + связь с `Appointment`.
- **Infrastructure:** `YooKassaAdapter` (ACL), HTTP client, secrets.

---

## 6) Data model
- `payments`: `appointment_id`, `provider=yookassa`, `provider_payment_id`, `status`, `amount`, `currency`, `created_at`.

---

## 7) API
| Endpoint | Method | Auth | Request | Response |
|---|---:|---|---|---|
| `/api/public/payments` | POST | public/auth | `{appointment_id}` | `{payment_id, confirmation}` |

---

## 8) Tracking
- `payment_started` (provider, amount, currency, service_slug)

---

## 9) Security
- секреты YooKassa только в secret store; не логировать request/response body.

---

## 12) Test plan
- integration: создать payment → проверить запись в БД + корректный provider id.


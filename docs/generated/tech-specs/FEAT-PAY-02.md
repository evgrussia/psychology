# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-PAY-02`  
**Epic:** `EPIC-05`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Обрабатываем webhooks ЮKassa: валидация, идемпотентность, обновление статуса платежа и генерация “истинных” серверных событий (`booking_paid`, `payment_failed`).

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-PAY-2)
- Tracking: `docs/Tracking-Plan.md` (`booking_paid`, `payment_failed`)
- Архитектура: `docs/Архитектурный-обзор.md` (truth on backend)

---

## 2) Goals
- **G1:** Дедупликация webhook по `event_id`/`provider_payment_id`.
- **G2:** Безопасная обработка повторов и out-of-order событий.
- **G3:** Логи/алерты на критичные сбои (в связке с `FEAT-AN-03`).

---

## 3) AC / Негативные
- [ ] AC-1 Один webhook = один эффект (идемпотентно).
- [ ] AC-2 Не подтверждать запись на основании фронтенда.
- **NS:** неизвестный payment_id → 202/логируем (не падаем).

---

## 5) Архитектура
- **Application:** `HandlePaymentWebhookUseCase`.
- **Domain:** `Payment` агрегат/VO.
- **Infrastructure:** endpoint `/api/webhooks/yookassa`, secure config.

---

## 6) Data model
- `payments` + (опционально) `payment_webhook_events` (event_id unique) для дедупликации.

---

## 7) API
| Endpoint | Method | Auth | Назначение |
|---|---:|---|---|
| `/api/webhooks/yookassa` | POST | provider | принять webhook |

---

## 8) Tracking
Серверные события:
- `booking_paid` (после succeeded)
- `payment_failed` (failure_category)

---

## 9) Security
- Верификация webhook согласно YooKassa docs (секрет/подпись/allowlist, что применимо).
- Не логировать payload полностью.

---

## 12) Test plan
- integration: отправить webhook succeeded дважды → один эффект.
- out-of-order: failed после succeeded → не откатываем succeeded без явного правила.


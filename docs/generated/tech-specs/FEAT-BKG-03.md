# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-BKG-03`  
**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~220k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем пользовательский флоу записи: `/booking/` → выбор услуги → выбор слота → анкета → согласия → оплата → подтверждение. Флоу учитывает таймзоны, правила отмены/переноса и “истину статуса” со стороны backend.

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-BKG-1..5)
- IA: `docs/information-architecture.md` (`/booking/*`)
- Tracking: `docs/Tracking-Plan.md` (booking events, запреты по анкете)
- Domain model: `docs/Domain-Model-Specification.md` (Appointment aggregate, IntakeForm)
- Security: `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** UX шаги из IA доступны и не “тупиковые”.
- **G2:** Анкета короткая (5–8), P2 payload шифруется “в покое”.
- **G3:** Раздельные согласия (см. `FEAT-SEC-01`), отображение документов.
- **G4:** Пользователь понимает правила отмены/переноса до оплаты.

### 2.2 Non-goals
- Сложные сценарии пакетов/абонементов.

---

## 3) Scope / AC
- [ ] AC-1 Слоты показываются в локальной таймзоне пользователя.
- [ ] AC-2 После оплаты подтверждение записи приходит только от backend (webhook).
- [ ] AC-3 Состояние “нет слотов” ведёт в `/booking/no-slots/` (см. BKG-05).
- [ ] AC-4 Анкета не уходит в аналитику.

Негативные:
- оплата неуспешна → бережный retry/альтернатива.

---

## 4) UX / UI
- `/booking/` (можно объединять экраны, но URL паттерн IA сохраняем)
- UI состояния: loading, validation errors, payment redirect, confirmation.
- A11y: формы с label, ошибки aria-live.

---

## 5) Архитектура

### 5.1 Компоненты/модули
- **Presentation:** booking pages + API controllers.
- **Application:** use cases:
  - `StartBookingUseCase`
  - `SelectSlotUseCase`
  - `SubmitIntakeUseCase`
  - `UpdateConsentsUseCase` (см. SEC-01)
  - `CreatePaymentIntentUseCase` (см. PAY-01)
- **Domain:** `Appointment`, `TimeSlot`, `IntakeForm` (encrypted), `BookingMetadata`.
- **Infrastructure:** repositories + integrations (GCal, YooKassa).

---

## 6) Data model
Используем:
- `appointments` (pending_payment/confirmed)
- `intake_forms` (encrypted_payload, submitted_at)
- `consents` (см. SEC-01)

P2: анкета.

---

## 7) API

### 7.1 Public API (web)
| Endpoint | Method | Auth | Назначение |
|---|---:|---|---|
| `/api/public/booking/start` | POST | public/auth | начать бронирование (create appointment pending_payment) |
| `/api/public/booking/slots` | GET | public | слоты (из BKG-02) |
| `/api/public/booking/{id}/intake` | POST | public/auth | отправка анкеты (encrypted) |
| `/api/public/booking/{id}/consents` | POST | public/auth | зафиксировать согласия |

> Платёж создаётся отдельным endpoint в PAY-01 и привязан к appointment.

---

## 8) Tracking
По Tracking Plan:
- `booking_start`
- `service_selected`
- `booking_slot_selected`
- `intake_started`, `intake_submitted` (без ответов)
- `booking_paid`/`booking_confirmed` (server truth, см. PAY-02/03)
- `show_no_slots`, `waitlist_submitted` (BKG-05)

---

## 9) Security/Privacy
- анкета — P2 encrypted; доступ только owner/assistant по необходимости; не в аналитике.
- CSRF/anti‑bot защита на формах (rate limit).

---

## 10) Надёжность
- UI не доверяет “успеху” оплаты на фронте; ждёт backend status.

---

## 12) Test plan
- e2e: booking_start → slot_selected → intake → consents → payment redirect → confirmation (с моками webhooks).
- privacy: network/event payload не содержит ответов анкеты.


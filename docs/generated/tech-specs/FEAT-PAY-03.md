# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-PAY-03`  
**Epic:** `EPIC-05`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~80k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Связываем оплату и подтверждение записи: запись переходит в `confirmed` только после webhook `succeeded`, после чего создаём бронь/событие (в т.ч. в Google Calendar) и отправляем уведомления.

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-PAY-3, FR-BKG-6)
- Domain model: `docs/Domain-Model-Specification.md` (confirmPayment)
- Tracking: `docs/Tracking-Plan.md` (`booking_confirmed`)

---

## 2) Goals
- **G1:** Backend оркестрация: `payment_succeeded` → `booking_paid` → create calendar event → `booking_confirmed`.
- **G2:** Идемпотентность на каждом шаге.

---

## 3) AC
- [ ] AC-1 `booking_confirmed` генерируется только после успешного webhook.
- [ ] AC-2 Создание события в календаре повторяемо и не создаёт дубль.

---

## 5) Архитектура
- **Application:** `ConfirmAppointmentAfterPaymentUseCase`.
- **Infrastructure:** GCal adapter (BKG-02), email sender.

---

## 6) Data model
- `appointments.status` (pending_payment → confirmed)
- `appointments.calendar_event_id` (для дедупликации создания события)

---

## 8) Tracking
- `booking_confirmed` (server truth)

---

## 12) Test plan
- integration: payment webhook succeeded → appointment confirmed + event created.


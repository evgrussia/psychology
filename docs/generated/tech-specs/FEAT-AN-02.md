# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-AN-02`  
**Epic:** `EPIC-10`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary
“Истинные” серверные события: оплата/подтверждение/исход встречи фиксируются только на backend (webhooks/админ‑действия) и отправляются в аналитику.

### Ссылки
- Tracking plan: `docs/Tracking-Plan.md` (6.7, 6.7.1)
- Payments: `FEAT-PAY-02/03`
- Admin spec: `docs/Admin-Panel-Specification.md` (no-show)

---

## 2) Goals
- `booking_paid` — только по webhook,
- `booking_confirmed` — после атомарного создания брони,
- `appointment_outcome_recorded` — после отметки исхода в админке.

---

## 3) AC
- [ ] AC-1 События не дублируются и не отправляются дважды (dedupe по event_id).

---

## 12) Test plan
- integration: webhook → booking_paid, confirm → booking_confirmed.


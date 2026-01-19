# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.2  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** implemented  

**Feature ID:** `FEAT-BKG-02` (revised, no GCal)  
**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

---

## 1) Summary

### 1.1 Что делаем
Реализуем внутреннюю доступность записи: слоты/блокировки/бронь хранятся в БД, публичная запись и админ‑расписание не зависят от внешних календарей. Google Calendar не используется.

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-BKG-6, FR-BKG-7)
- `docs/tech-specs/Remove-Google-Calendar-Integration-Spec.md`
- Tracking: `docs/Tracking-Plan.md` (booking_slot_selected, booking_conflict)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Выдача слотов основана на внутренних данных, без `calendar_unavailable`.
- **G2:** Конфликты времени исключаются через резерв/занятость.
- **G3:** Админ‑расписание управляет внутренними слотами и блокировками.

### 2.2 Non-goals
- Любые внешние календарные интеграции.
- Полная переделка расписания.

---

## 3) Scope / AC
- [x] AC-1 Публичные слоты/альтернативы не возвращают `calendar_unavailable`.
- [x] AC-2 UI выбора слота показывает доступные интервалы в таймзоне пользователя.
- [x] AC-3 Конфликты возвращают `409 { code: "slot_conflict" }`.
- [x] AC-4 Админ‑расписание работает без Google Calendar.

Негативные:
- Нет доступных слотов → empty‑state + waitlist.

---

## 4) UX / UI
- admin: `/admin/schedule/` (внутренние слоты/блокировки).
- web: `/booking/slot/` показывает слоты в локальной таймзоне.

---

## 5) Архитектура (Clean Architecture)

### 5.1 Компоненты/модули
- **Domain:** `TimeSlot`, `AvailabilitySlot`, `Appointment`.
- **Application:**
  - `ListAvailableSlotsUseCase`
  - `GetBookingAlternativesUseCase`
  - `StartBookingUseCase`
  - `ReserveSlotForAppointmentUseCase`
- **Infrastructure:** Prisma‑репозитории слотов/встреч, без внешних интеграций.

### 5.2 Доменные события
- Не добавляем.

---

## 6) Data model
- `availability_slots` (status: available/reserved/blocked)
- `appointments` (pending_payment/paid/confirmed)
- `schedule_settings`

---

## 7) API
Public:
- `GET /api/public/booking/slots?service_slug=...&from=...&to=...&tz=...`
- `GET /api/public/booking/alternatives?service_slug=...&tz=...`

---

## 8) Tracking
По Tracking Plan:
- `booking_slot_selected` (slot_start_at, timezone, service_slug)
- `booking_conflict` (service_slug)

---

## 9) Security/Privacy
- PII не уходит в аналитику.
- Доступ к admin‑расписанию ограничен ролями.

---

## 10) Надёжность, деградации
- При отсутствии слотов — единый empty‑state без ошибок.

---

## 11) Rollout plan
- Реализовано без внешних интеграций.

---

## 12) Test plan
- unit/integration: расчёт доступности и резервации слота.
- e2e: booking flow + no‑slots → waitlist.

---

## 13) Open questions / решения
- Нужно ли учитывать `appointments` со статусом `rescheduled` как занятость?


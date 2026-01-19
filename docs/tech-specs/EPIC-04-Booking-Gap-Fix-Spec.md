# Техническая спецификация: EPIC-04 (Booking) — внутренняя доступность без GCal

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.2  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** implemented  

**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Фиксируем, что `FEAT-BKG-02` реализован через внутренний источник доступности. Google Calendar полностью исключён: слоты/блокировки/бронь хранятся в БД, публичная запись и админ‑расписание работают на внутренних данных.

### 1.2 Почему сейчас
- **Решение:** Google Calendar не используется в продукте.
- **Эффект:** стабильная выдача слотов без внешних зависимостей.
- **Риск без фиксации:** рассинхрон документации с реализацией.

### 1.3 Ссылки
- `docs/tech-specs/Remove-Google-Calendar-Integration-Spec.md`
- `docs/Tracking-Plan.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Публичные слоты и альтернативы основаны только на внутренних данных.
- **G2:** В админке нет экранов/кнопок/эндпоинтов Google Calendar.
- **G3:** Конфликты времени исключаются через резерв/занятость.

### 2.2 Non-goals
- Внешние календарные интеграции.
- Полная переработка расписания.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US‑1:** Web получает доступные слоты из внутреннего расписания.
- **US‑2:** Админ управляет слотами и блокировками без GCal.
- **US‑3:** Занятость учитывается по `availability_slots` и `appointments`.

### 3.2 Acceptance criteria
- [x] `/public/booking/slots` и `/public/booking/alternatives` возвращают только `status = available`.
- [x] В коде нет сущностей/клиентов Google Calendar.
- [x] Админ‑UI не содержит Google Calendar интеграции.
- [x] Конфликты слотов обрабатываются через резерв/идемпотентность.

---

## 4) Архитектура и ответственность слоёв

### 4.1 Компоненты/модули
- **Domain:** `AvailabilitySlot`, `Appointment`, `TimeSlot`, `ScheduleSettings`.
- **Application:** `ListAvailableSlotsUseCase`, `GetBookingAlternativesUseCase`, `StartBookingUseCase`, `ReserveSlotForAppointmentUseCase`.
- **Infrastructure:** Prisma‑репозитории слотов/встреч.
- **Presentation:** public booking endpoints, admin schedule UI.

---

## 5) Data model

- `availability_slots` (status: available/reserved/blocked)
- `appointments` (status: pending_payment/paid/confirmed)
- `schedule_settings`
- Таблиц/enum для Google Calendar нет.

---

## 6) API / Контракты

- `GET /api/public/booking/slots`
- `GET /api/public/booking/alternatives`
- `POST /api/public/booking/start`
- `POST /api/public/booking/{id}/intake`
- `POST /api/public/booking/{id}/consents`
- `GET /api/public/booking/{id}/status`

---

## 7) Tracking / Analytics

- `booking_start`
- `booking_slot_selected`
- `booking_conflict`
- `show_no_slots`, `waitlist_submitted`

---

## 8) Test plan

### 8.1 Unit/Integration
- `ListAvailableSlotsUseCase` фильтрует занятость по слотам и встречам.
- `StartBookingUseCase` резервирует слот и возвращает 409 при конфликте.

### 8.2 E2E
- Booking flow от выбора услуги до подтверждения.
- No‑slots сценарий → waitlist.

---

## 9) Open questions

- Нужно ли учитывать `appointments` со статусом `rescheduled` как занятость?
- Оставляем ли `appointments.slot_id` обязательным для всех созданий (admin/manual)?

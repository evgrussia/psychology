# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-BKG-02`  
**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~260k токенов (≤ 270k, близко к лимиту → см. slices)

---

## 1) Summary

### 1.1 Что делаем
Реализуем расписание/слоты на базе Google Calendar: двусторонняя синхронизация (import busy → блок слотов; export bookings → события в календарь), работа с таймзонами и защита от конфликтов.

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-BKG-6, FR-BKG-7)
- Technical decisions: `docs/Technical-Decisions.md` (двусторонняя sync)
- Архитектура: `docs/Архитектурный-обзор.md` (ACL для GCal)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.2 расписание)
- Tracking: `docs/Tracking-Plan.md` (booking_slot_selected, booking_conflict)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Подключение Google Calendar (OAuth) из админки.
- **G2:** Чтение занятости/событий → блокировка соответствующих слотов в продукте.
- **G3:** Создание события в календаре при подтверждённой записи (export).
- **G4:** Периодическая синхронизация (каждые ~15 минут) + обработка изменений (webhook, если применимо).
- **G5:** Конфликт‑резолюция: продукт — источник истины для брони, календарь — источник занятости (см. Tech decisions 4.1).

### 2.2 Non-goals
- Сложные правила “несколько календарей” и “комнаты” (для релиза 1 один владелец).

---

## 3) Scope / AC
- [ ] AC-1 Админ подключает календарь и видит статус интеграции.
- [ ] AC-2 UI выбора слота показывает доступные интервалы в таймзоне пользователя.
- [ ] AC-3 При подтверждении записи создаётся событие в GCal.
- [ ] AC-4 В случае конфликта запись не подтверждается, пользователь получает альтернативы.

Негативные:
- GCal недоступен → деградация: слоты временно не показываем или показываем “проверьте позже” + waitlist.

---

## 4) UX / UI
- admin: `/admin/settings/integrations` (или раздел интеграций), `/admin/schedule/`.
- web: `/booking/slot/` показывает календарь слотов.

---

## 5) Архитектура (Clean Architecture)

### 5.1 Компоненты/модули
- **Domain:** `TimeSlot`, `Availability`, `Appointment` (Booking context), `GoogleCalendarAccount` (integration config VO).
- **Application:**
  - `ConnectGoogleCalendarUseCase`
  - `SyncCalendarBusyTimesUseCase`
  - `CreateCalendarEventForAppointmentUseCase`
  - `ListAvailableSlotsUseCase`
- **Infrastructure:**
  - `IGoogleCalendarService` интерфейс в домене,
  - `GoogleCalendarAdapter` (ACL) + OAuth token store,
  - background job runner (cron/queue).

### 5.2 Доменные события
- `AppointmentConfirmed` → consumer: calendar event creator.

---

## 6) Data model
По `docs/Модель-данных.md` (или дополняем):
- `integrations_google_calendar`:
  - calendar_id, oauth tokens (encrypted), timezone, status
- `calendar_busy_intervals` (опционально, кэш) **или** вычисление on-the-fly через freeBusy API
- `slots`/`availability_rules` (если делаем генерацию слотов на стороне продукта)
- `appointments` (confirmed/pending_payment)

P2: oauth refresh/access tokens (шифровать).

---

## 7) API
Admin:
- `POST /api/admin/integrations/google-calendar/connect` (OAuth start/callback)
- `POST /api/admin/integrations/google-calendar/sync`

Public:
- `GET /api/public/booking/slots?service_slug=...&from=...&to=...&tz=...`

---

## 8) Tracking
По Tracking Plan:
- `booking_slot_selected` (slot_start_at, timezone, service_slug)
- `booking_conflict` (service_slug)

---

## 9) Security/Privacy
- OAuth tokens — P2: шифровать “в покое” (`FEAT-SEC-02`) и не логировать.
- Webhook endpoints защищать (проверка source/секретов, где возможно).

---

## 10) Надёжность, деградации
- Retry/backoff на вызовы Google API.
- Кэширование availability на 5–15 минут (Admin spec допускает кэш для тяжёлых запросов).

---

## 11) Rollout plan
- `gcal_integration_enabled`: internal → stage → prod.

---

## 12) Test plan
- integration: mock GCal API (или sandbox), проверить:
  - чтение busy интервалов,
  - создание события,
  - конфликт при busy.

---

## 13) Open questions / решения
- [ ] Webhook vs polling: для релиза 1 допускаем polling каждые 15 минут; webhook — улучшение при возможности.

---

## Appendix: Implementation slices (чтобы уложиться в контекст)

1. **Slice A (~80k):** OAuth подключение + хранение токенов (encrypted) + health/status.
2. **Slice B (~70k):** `freeBusy`/read events → вычисление доступных слотов (без UI) + API.
3. **Slice C (~60k):** создание события в календаре при `booking_confirmed` + обработка ошибок.
4. **Slice D (~50k):** background sync (polling) + кэширование + базовые алерты/логи.


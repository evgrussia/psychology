# Техническая спецификация: удаление Google Calendar и внутренняя запись

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Feature ID:** `FEAT-REF-BOOKING-01` (TBD)  
**Epic:** `EPIC-BKG` (TBD)  
**Приоритет:** P1  
**Трекер:** TBD  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Полностью удаляем интеграцию Google Calendar и переводим запись на внутренний источник доступности: слоты/блокировки/бронь в БД. Публичная запись и админ‑расписание больше не зависят от внешнего календаря.

### 1.2 Почему сейчас
- **Сигнал/боль:** запись недоступна без подключенной интеграции.
- **Ожидаемый эффект:** стабильная доступность записи без внешних зависимостей.
- **Если не сделать:** риск простоя записи при сбоях интеграции.

### 1.3 Ссылки на первоисточники
- Data model: `docs/Модель-данных.md`
- Domain model: `docs/Domain-Model-Specification.md`
- Booking research: `docs/research/05-Booking-Payment-ClientCabinet.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Удалить все части Google Calendar интеграции из API, домена, инфраструктуры и UI.
- **G2:** Обеспечить выдачу слотов на основе внутренних данных без статуса `calendar_unavailable`.
- **G3:** Сохранить корректное исключение конфликтов времени (резервы/блокировки/аппойнтменты).

### 2.2 Non-goals
- **NG1:** Новая внешняя интеграция календаря.
- **NG2:** Перепроектирование админ‑расписания/форм записи.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US‑1:** Пользователь веба получает доступные слоты, даже если Google Calendar не подключён.
- **US‑2:** Админ управляет расписанием без разделов Google Calendar.
- **US‑3:** Сервис корректно блокирует слоты по внутренним данным.

### 3.2 Out-of-scope
- синхронизация с любыми внешними календарями.
- импорт событий из календаря.

### 3.3 Acceptance criteria
- [ ] Публичные эндпоинты выдачи слотов/альтернатив не возвращают `calendar_unavailable`.
- [ ] В админке отсутствуют страницы/кнопки/таблицы Google Calendar.
- [ ] В БД нет таблиц/полей/enum, связанных с Google Calendar.
- [ ] Фоновый scheduler синхронизации удалён.
- [ ] Автотесты обновлены и проходят без Google Calendar зависимостей.

### 3.4 Негативные сценарии
- **NS‑1:** Нет доступных слотов → корректный empty‑state без ошибок.
- **NS‑2:** Ошибка чтения БД → единый обработчик ошибок (без упоминаний календаря).

---

## 4) UX / UI

### 4.1 Изменения экранов
- **Admin:** `apps/admin/src/app/settings/page.tsx` — убрать вкладку “Integrations / Google Calendar”.
- **Admin:** `apps/admin/src/app/schedule/page.tsx` — убрать блок “Google Calendar” и кнопку синхронизации.
- **Web:** `apps/web/src/app/booking/slot/BookingSlotClient.tsx` — убрать экран “Календарь временно недоступен”.
- **Web:** `apps/web/src/app/booking/no-slots/NoSlotsClient.tsx` — убрать копирайт про “календарь недоступен”.

### 4.2 A11y
- Никаких новых компонент; убедиться, что удалённые блоки не ломают фокус‑порядок.

---

## 5) Архитектура и ответственность слоёв

### 5.1 Компоненты/модули
- **Presentation:** удалить `AdminGoogleCalendarController`, маршруты `/admin/integrations/google-calendar/*`.
- **Application:** удалить use cases Google Calendar; обновить booking use cases для работы без интеграции.
- **Domain:** удалить сущности/интерфейсы Google Calendar.
- **Infrastructure:** удалить сервисы OAuth/API Google Calendar, scheduler, prisma‑репозитории и мапперы.

### 5.2 Основные use cases
- Обновить:  
  - `ListAvailableSlotsUseCase.execute(params)`  
  - `GetBookingAlternativesUseCase.execute(params)`

### 5.3 Доменные события
Не добавляем.

---

## 6) Модель данных и миграции

### 6.1 Удаляемые сущности/поля
- `GoogleCalendarIntegration` и enum `GoogleCalendarIntegrationStatus`.
- Поле `system_settings.google_calendar_sync_mode`.
- Поле `appointments.external_calendar_event_id`.
- Enum‑значение `availability_slots.source = google_calendar`.

### 6.2 Миграции
- **Forward:**
  1. Удалить записи `availability_slots` с `source = 'google_calendar'`.
  2. Обнулить `appointments.external_calendar_event_id` (если остаётся до миграции).
  3. Удалить таблицу `integrations_google_calendar`.
  4. Удалить enum `GoogleCalendarIntegrationStatus`.
  5. Удалить поле `google_calendar_sync_mode` из `system_settings`.
  6. Удалить `external_calendar_event_id` из `appointments`.
  7. Обновить enum `availability_slots.source`.
- **Rollback:** не предусматривается (полное удаление интеграции).

---

## 7) API / Контракты

### 7.1 Public API (web)
- `/public/booking/slots`  
  - **Response:** `status` только `available`; `calendar_unavailable` удалён.  
- `/public/booking/alternatives`  
  - **Response:** `status` только `available`; `calendar_unavailable` удалён.

### 7.2 Admin API
- Удалить `/admin/integrations/google-calendar/*`.

---

## 8) Реализация внутренней доступности слотов

### 8.1 Источники занятости
Вместо Google Calendar используем только внутренние данные:
- `availability_slots` со статусом `blocked` (исключения/буферы).
- `availability_slots` со статусом `reserved` (забронированные слоты).
- `appointments` в статусах `pending_payment`, `paid`, `confirmed` (на случай, если слот не привязан).

### 8.2 Изменения в коде
Обновить расчёт доступности в:
- `apps/api/src/application/booking/use-cases/ListAvailableSlotsUseCase.ts`
- `apps/api/src/application/booking/use-cases/GetBookingAlternativesUseCase.ts`

Добавить метод в репозиторий (если нужен):
- `IAppointmentRepository.findBusyInRange(from, to)` или использовать существующий `findByRange` с фильтром статусов.

Обновить `IAvailabilitySlotRepository`:
- заменить `findBusySlots` (Google) на `findReservedSlots` или аналогичную логику.

---

## 9) Конфиги/ENV/инфраструктура

Удалить:
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES`
- `GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS`

Обновить:
- `apps/api/src/infrastructure/config/env.validation.ts`
- `.env.example`, `.env.prod.example`
- `apps/api/src/infrastructure/config/http-client.config.ts` (таймауты google_calendar)

---

## 10) Логи/алерты/аудит

Удалить:
- Audit actions: `ADMIN_GOOGLE_CALENDAR_*` из `audit-log.dto.ts`.
- Alerts keys: `google_calendar_*` из `google-calendar-sync.scheduler.ts`.

---

## 11) Rollout plan

1. Выполнить миграции БД.
2. Задеплоить API без Google Calendar интеграции.
3. Задеплоить admin/web UI без упоминаний календаря.

---

## 12) Test plan

### 12.1 Unit tests
- Обновить/удалить unit tests для Google Calendar use cases.
- Добавить тесты расчёта доступности без внешней интеграции.

### 12.2 Integration tests
- Проверить `/public/booking/slots` и `/public/booking/alternatives` на пустые слоты.
- Проверить админ‑расписание (создание слотов/исключений/буферов).

### 12.3 E2E
- `apps/web/e2e/booking.spec.ts`: убрать ожидание `calendar_unavailable`.

---

## 13) Open questions

- Нужно ли учитывать `appointments` со статусом `rescheduled` как занятость?
- Оставляем ли `appointments.slot_id` обязательным для всех созданий (admin/manual)?
- Нужна ли новая роль/permission для операций с расписанием, ранее завязанных на интеграцию?


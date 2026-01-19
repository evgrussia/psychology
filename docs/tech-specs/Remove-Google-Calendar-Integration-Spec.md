# Техническая спецификация: внутренняя запись без Google Calendar

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

## 1) Summary (коротко)

### 1.1 Что делаем
Фиксируем реализацию внутренней доступности записи: слоты/блокировки/бронь хранятся в БД, публичная запись и админ‑расписание не зависят от внешних календарей. Google Calendar сознательно не используется.

### 1.2 Почему сейчас
- **Решение:** Google Calendar исключён из продукта.
- **Эффект:** стабильная доступность записи без внешних зависимостей.
- **Риск без реализации:** простои при внешних сбоях.

### 1.3 Ссылки на первоисточники
- Data model: `docs/Модель-данных.md`
- Domain model: `docs/Domain-Model-Specification.md`
- Booking research: `docs/research/05-Booking-Payment-ClientCabinet.md`
### 1.4 Реализовано в коде
- `apps/api/src/application/booking/use-cases/ListAvailableSlotsUseCase.ts`
- `apps/api/src/application/booking/use-cases/GetBookingAlternativesUseCase.ts`
- `apps/api/src/infrastructure/persistence/prisma/booking/prisma-appointment.repository.ts`
- `apps/admin/src/app/schedule/page.tsx`
- `apps/web/src/app/booking/slot/BookingSlotClient.tsx`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Отсутствуют части Google Calendar интеграции в API, домене, инфраструктуре и UI.
- **G2:** Выдача слотов основана на внутренних данных, статус `calendar_unavailable` не используется.
- **G3:** Корректно исключаются конфликты времени (резервы/блокировки/аппойнтменты).

### 2.2 Non-goals
- **NG1:** Любая внешняя интеграция календаря.
- **NG2:** Полная переделка админ‑расписания/форм записи.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US‑1:** Пользователь веба получает доступные слоты из внутренних данных.
- **US‑2:** Админ управляет расписанием без разделов Google Calendar.
- **US‑3:** Сервис корректно блокирует слоты и учитывает занятые интервалы по внутренним данным.

### 3.2 Out-of-scope
- синхронизация с любыми внешними календарями.
- импорт событий из календаря.

### 3.3 Acceptance criteria
- [x] Публичные эндпоинты выдачи слотов/альтернатив не возвращают `calendar_unavailable`.
- [x] В админке отсутствуют страницы/кнопки/таблицы Google Calendar.
- [x] В коде отсутствуют сущности/интерфейсы/клиенты Google Calendar.
- [x] Фоновый scheduler синхронизации отсутствует.
- [x] Тесты обновлены и не зависят от Google Calendar.

### 3.4 Негативные сценарии
- **NS‑1:** Нет доступных слотов → корректный empty‑state без ошибок.
- **NS‑2:** Ошибка чтения БД → единый обработчик ошибок (без упоминаний календаря).

---

## 4) UX / UI

### 4.1 Изменения экранов
- **Admin:** нет вкладки “Integrations / Google Calendar”.
- **Admin:** расписание управляется внутренними слотами, без кнопок синка.
- **Web:** экран слотов без состояния “календарь недоступен”.
- **Web:** no‑slots не упоминает календарь.

### 4.2 A11y
- Никаких новых компонент; убедиться, что удалённые блоки не ломают фокус‑порядок.

---

## 5) Архитектура и ответственность слоёв

### 5.1 Компоненты/модули
- **Presentation:** отсутствуют маршруты `/admin/integrations/google-calendar/*`.
- **Application:** use cases работают с внутренними слотами/appointment.
- **Domain:** отсутствуют сущности/интерфейсы Google Calendar.
- **Infrastructure:** отсутствуют сервисы OAuth/API Google Calendar и scheduler.

### 5.2 Основные use cases
- `ListAvailableSlotsUseCase.execute(params)` использует внутренние слоты и занятость.
- `GetBookingAlternativesUseCase.execute(params)` возвращает альтернативы на основе внутренних данных.

### 5.3 Доменные события
Не добавляем.

---

## 6) Модель данных и миграции

### 6.1 Сущности/поля (актуально)
- `GoogleCalendarIntegration` и связанные enums отсутствуют.
- `availability_slots.source` использует только внутренние источники.
- `appointments.external_calendar_event_id` отсутствует.

### 6.2 Миграции
- Миграции выполнены в рамках внедрения внутренней доступности.
- Дополнительный rollback не предусматривается.

---

## 7) API / Контракты

### 7.1 Public API (web)
- `/public/booking/slots`  
  - **Response:** `status` только `available`.
- `/public/booking/alternatives`  
  - **Response:** `status` только `available`.

### 7.2 Admin API
- Нет эндпоинтов `/admin/integrations/google-calendar/*`.

---

## 8) Реализация внутренней доступности слотов

### 8.1 Источники занятости
Вместо Google Calendar используем только внутренние данные:
- `availability_slots` со статусом `blocked` (исключения/буферы).
- `availability_slots` со статусом `reserved` (забронированные слоты).
- `appointments` в статусах `pending_payment`, `paid`, `confirmed` (на случай, если слот не привязан).

### 8.2 Реализация в коде
- `ListAvailableSlotsUseCase` использует:
  - `availability_slots` со статусами `available/reserved/blocked`
  - `appointments` в статусах `pending_payment/paid/confirmed`
- `GetBookingAlternativesUseCase` строит альтернативы из внутренних слотов.
- Добавлено в репозиторий: `IAppointmentRepository.findBusyInRange(from, to)`.
- `IAvailabilitySlotRepository` использует `findReservedSlots` и `findBlockedSlots`.

---

## 9) Конфиги/ENV/инфраструктура

Удалены:
- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_SYNC_INTERVAL_MINUTES`
- `GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS`

Обновлены:
- `apps/api/src/infrastructure/config/env.validation.ts`
- `.env.example`, `.env.prod.example`
- `apps/api/src/infrastructure/config/http-client.config.ts` (таймауты google_calendar)

---

## 10) Логи/алерты/аудит

Удалено:
- Audit actions: `ADMIN_GOOGLE_CALENDAR_*` из `audit-log.dto.ts`.
- Alerts keys: `google_calendar_*` из `google-calendar-sync.scheduler.ts`.

---

## 11) Rollout plan

Реализовано и развернуто с внутренним источником доступности.

---

## 12) Test plan

### 12.1 Unit tests
- Тесты расчёта доступности опираются на внутренние слоты/appointments.

### 12.2 Integration tests
- Проверить `/public/booking/slots` и `/public/booking/alternatives` на пустые слоты.
- Проверить админ‑расписание (создание слотов/исключений/буферов).

### 12.3 E2E
- `apps/web/e2e/booking.spec.ts` не зависит от `calendar_unavailable`.

---

## 13) Open questions

- Нужно ли учитывать `appointments` со статусом `rescheduled` как занятость?
- Оставляем ли `appointments.slot_id` обязательным для всех созданий (admin/manual)?


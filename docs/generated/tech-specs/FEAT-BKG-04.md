# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-BKG-04`  
**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Добавляем защиту от гонок при записи на слот: атомарная проверка доступности и резервирование, идемпотентность ключевых операций и корректная обработка конфликтов (FR-BKG-7).

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-BKG-7)
- Domain model: `docs/Domain-Model-Specification.md` (SlotAvailabilityService, saveWithConflictCheck)
- Tracking: `docs/Tracking-Plan.md` (`booking_conflict`)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** При конкурирующих попытках записи подтверждается только одна.
- **G2:** Конфликт возвращает понятный UX + альтернатива.
- **G3:** Идемпотентность:
  - создание appointment (по client_request_id),
  - обработка webhook (по provider event id),
  - подтверждение брони.

### 2.2 Non-goals
- Distributed locking (Redis) обязателен только при необходимости; для релиза 1 достаточно транзакций/уникальностей в Postgres.

---

## 3) Scope / AC
- [ ] AC-1 API бронирования использует транзакцию + проверку пересечения интервалов.
- [ ] AC-2 Возвращаем 409/Conflict и стреляем `booking_conflict`.
- [ ] AC-3 Конфликт не приводит к “двойной оплате” (см. PAY-02 idempotency).

---

## 5) Архитектура
- **Application:** `ReserveSlotUseCase` / `BookAppointmentUseCase`.
- **Infrastructure:** `saveWithConflictCheck` в репозитории + уникальные индексы (где возможно).

---

## 6) Data model
Подход:
- хранить `appointments` с `start_at_utc`, `end_at_utc`, `status`.
- индекс по диапазону (например, `tsrange` + GiST) для overlap check **или** транзакционная проверка `WHERE start < new_end AND end > new_start AND status IN (...)`.
- уникальный `idempotency_key` на уровне appointment creation (опционально).

---

## 7) API
- При конфликте: `409 { code: "slot_conflict" }`.

---

## 8) Tracking
- `booking_conflict` (service_slug)

---

## 12) Test plan
- integration: два параллельных запроса на один слот → один успех, один conflict.
- e2e: пользователь получает альтернативы.


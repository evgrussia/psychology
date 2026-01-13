# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-AN-01`  
**Epic:** `EPIC-10`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~140k токенов (≤ 270k)

---

## 1) Summary
Реализуем Tracking Plan: единый event schema, идентификаторы (`anonymous_id/user_id/lead_id`), клиентский `track()` адаптер с валидацией запретов и серверный ingestion (self-hosted) или отправка во внешний провайдер.

### Ссылки
- Tracking plan: `docs/Tracking-Plan.md`
- PRD: `docs/PRD.md` (NFR-AN)

---

## 2) Goals
- единая схема события (schema_version, event_id, occurred_at, source, env, ids, page, acquisition, properties),
- запрет PII/текста на уровне валидатора,
- генерация `anonymous_id` и session_id,
- создание/обновление `lead_id` при “контактных” действиях.

---

## 3) AC
- [ ] AC-1 Все события из “минимального набора” PRD реализованы.
- [ ] AC-2 Валидатор блокирует запрещённые поля.

---

## 6) Data model
Если self-hosted:
- `analytics_events` (P0 only) с индексами по event_name/occurred_at/source.

---

## 7) API
- `POST /api/analytics/ingest` (принимает события web/admin/tg, P0 only)

---

## 12) Test plan
- unit: валидатор запретов
- integration: ingest → записано → агрегации доступны для admin analytics.


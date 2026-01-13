# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-04`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~180k токенов (≤ 270k)

---

## 1) Summary
CRM‑лиды в админке: список/канбан статусов, карточка лида с таймлайном событий (P0-only), заметками и согласиями. Owner+assistant.

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (4.9)
- Tracking: `docs/Tracking-Plan.md` (lead_id, timeline events)
- Domain model: `docs/Domain-Model-Specification.md` (CRM Lead)

---

## 2) Goals
- pipeline статусов (new/engaged/booking_started/...),
- таймлайн событий из tracking (без текста),
- фильтры и поиск,
- заметки internal (если нужны) — шифровать (P2).

---

## 3) AC
- [ ] AC-1 Таймлайн не содержит PII/свободного текста событий.
- [ ] AC-2 Перетаскивание между статусами пишет audit log.

---

## 6) Data model
- `leads`, `lead_identities` (PII хранится, но не показывается editor),
- `lead_timeline_events` (P0 props),
- `lead_notes` (encrypted, optional).

---

## 7) API
- `GET /api/admin/leads`
- `GET /api/admin/leads/{lead_id}`
- `POST /api/admin/leads/{lead_id}/status`
- `POST /api/admin/leads/{lead_id}/notes`

---

## 12) Test plan
- e2e: открыть лид → увидеть таймлайн → сменить статус.


# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-MOD-02`  
**Epic:** `EPIC-09`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary
Backend-логика модерации: статусы, SLA, аудит действий модератора, метрики модерации. UI — в `FEAT-ADM-05`.

### Ссылки
- UGC rules: `docs/UGC-Moderation-Rules.md`
- Admin spec: `docs/Admin-Panel-Specification.md` (4.10.3 метрики)
- Tracking: `docs/Tracking-Plan.md` (`ugc_moderated`, `moderation_escalated`, `ugc_answered`)
- Audit: `FEAT-PLT-05`

---

## 2) Goals
- статусы: pending/flagged/approved/answered/rejected/published (для разных типов),
- действия: approve/reject/escalate/answer + reason_category (без текста),
- SLA вычисления (submit→decision, submit→answer).

---

## 3) AC
- [ ] AC-1 Все действия пишутся в audit log.
- [ ] AC-2 События модерации содержат только категории, без текста.

---

## 6) Data model
- `ugc_moderation_items`
- `moderation_actions` (moderator_id, decision, reason_category, created_at)
- `ugc_answers` (encrypted, owner_id, published_at)

---

## 7) API
- `POST /api/admin/moderation/items/{id}/approve|reject|escalate|answer`
- `GET /api/admin/moderation/metrics?range=...`

---

## 8) Tracking
- `ugc_moderated`
- `moderation_escalated`
- `ugc_answered`

---

## 12) Test plan
- integration: approve → answer → metrics computed.


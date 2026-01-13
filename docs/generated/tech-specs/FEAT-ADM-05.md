# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-05`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~150k токенов (≤ 270k)

---

## 1) Summary
Раздел `/admin/moderation/`: очередь модерации UGC (анонимные вопросы), статусы, триггеры, действия approve/reject/escalate/answer, метрики SLA. Owner+assistant.

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (4.10)
- UGC rules: `docs/UGC-Moderation-Rules.md`
- Moderation features: `FEAT-MOD-01`, `FEAT-MOD-02`

---

## 2) Goals
- таблица очереди + фильтры,
- карточка вопроса с чеклистом,
- шаблоны ответов (использует `message_templates`),
- запись действий в audit log.

---

## 3) AC
- [ ] AC-1 Assistant может модерировать, owner может публиковать ответ.
- [ ] AC-2 P2 тексты UGC показываются только тем, у кого есть доступ.
- [ ] AC-3 Метрики SLA считаются (pending age, avg time to moderation).

---

## 7) API
- `GET /api/admin/moderation/items`
- `GET /api/admin/moderation/items/{id}`
- `POST /api/admin/moderation/items/{id}/approve|reject|escalate|answer`

---

## 12) Test plan
- e2e: approve → answer → status=answered.


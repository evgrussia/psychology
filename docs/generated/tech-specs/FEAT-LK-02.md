# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-LK-02`  
**Epic:** `EPIC-07`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~200k токенов (≤ 270k)

---

## 1) Summary
Дневники в ЛК: “эмоции” и “ABC” (КПТ‑логика), с возможностью удаления. Тексты и детали — P2, шифруются, не попадают в аналитику.

### Ссылки
- PRD: `docs/PRD.md` (FR-LK-2)
- Tracking: `docs/Tracking-Plan.md` (`diary_entry_created/deleted`)
- Security: `FEAT-SEC-02`

---

## 2) Goals
- формы дневника (минимум 2 типа),
- список/фильтр по дате,
- удаление записи,
- опционально “без текста” режим (has_text=false).

Non-goals: общедоступный дневник, AI анализ.

---

## 3) AC
- [ ] AC-1 Записи доступны только владельцу.
- [ ] AC-2 В аналитике только `diary_type` и `has_text`, без содержания.
- [ ] AC-3 Удаление физическое или soft-delete с возможностью полного удаления при account deletion.

---

## 6) Data model
- `diary_entries`:
  - `user_id`, `diary_type`, `encrypted_payload`, `has_text`, `created_at`

---

## 7) API
- `POST /api/cabinet/diary` (create)
- `GET /api/cabinet/diary?type=...`
- `DELETE /api/cabinet/diary/{id}`

---

## 8) Tracking
- `diary_entry_created` (diary_type, has_text)
- `diary_entry_deleted` (diary_type)

---

## 9) Security/Privacy
- payload шифруем; не логируем.

---

## 12) Test plan
- integration: create/read/delete (ownership).
- privacy: убедиться, что payload не появляется в событиях/логах.


# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-MOD-01`  
**Epic:** `EPIC-09`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~140k токенов (≤ 270k)

---

## 1) Summary
Фича “Анонимный вопрос”: публичная форма (без обязательного контакта), анти‑PII фильтры, кризисные флаги, шифрование текста (P2) и постановка в очередь модерации.

### Ссылки
- PRD: `docs/PRD.md` (FR-ADM-10, UGC)
- IA: `docs/information-architecture.md` (`/interactive/anonymous-question/`)
- UGC rules: `docs/UGC-Moderation-Rules.md`
- Tracking: `docs/Tracking-Plan.md` (`question_submitted`, кризис события)
- Security: `FEAT-SEC-02`

---

## 2) Goals
- форма с правилами (“не экстренная помощь”, SLA 24–48ч, публикация),
- pre-check:
  - PII detection (email/phone) → просим удалить или маскируем,
  - crisis trigger → показываем экстренную помощь и блокируем отправку до подтверждения (по правилам).
- создание `ModerationItem` со статусом pending/flagged.

---

## 3) AC
- [ ] AC-1 Текст вопроса хранится только encrypted payload.
- [ ] AC-2 В аналитике нет текста вопроса.
- [ ] AC-3 Пользователь может опционально оставить контакт с согласием на коммуникации.

---

## 6) Data model
- `ugc_moderation_items` (type=anonymous_question, encrypted_content, status, trigger_flags)
- `moderation_actions` (позже)

---

## 7) API
- `POST /api/public/ugc/questions` (submit)
- `GET /api/public/ugc/questions/status/{id}` (опционально, без содержания)

---

## 8) Tracking
- `question_submitted` (channel=web, has_contact)
- `crisis_banner_shown` (если триггер)

---

## 12) Test plan
- integration: submit → stored encrypted → appears in moderation queue.
- privacy: events/logs без текста.


# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-SEC-01`  
**Epic:** `EPIC-11`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary
Раздельные согласия (ПДн/коммуникации/Telegram/публикация отзывов) и управление ими в web+ЛК, с записью версий и источника (web/telegram/admin).

### Ссылки
- PRD: `docs/PRD.md` (NFR-PRIV-2)
- Tracking: `docs/Tracking-Plan.md` (`consent_updated`, user properties)
- Data model: `docs/Модель-данных.md` (`consents`)

---

## 2) Goals
- фиксируем согласия при booking/waitlist/telegram,
- UI для просмотра/отзыва,
- версии текстов согласий.

---

## 3) AC
- [ ] AC-1 Без `consent_personal_data=true` нельзя отправлять PII формы (waitlist/booking).
- [ ] AC-2 Отзыв `communications` останавливает рассылки.

---

## 7) API
- `POST /api/consents` (update)
- `GET /api/consents` (current)

---

## 12) Test plan
- integration: revoke consent → блокировать отправку waitlist.


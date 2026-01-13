# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-LK-04`  
**Epic:** `EPIC-07`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~160k токенов (≤ 270k)

---

## 1) Summary
Self‑service управление данными: экспорт своих данных, удаление аккаунта, отзыв согласий (ПДн/коммуникации/Telegram) в ЛК.

### Ссылки
- PRD: `docs/PRD.md` (FR-LK-4, NFR-PRIV)
- Tracking: `docs/Tracking-Plan.md` (`consent_updated`, `account_deleted`)
- Security: `docs/research/10-Legal-Privacy-Compliance-RU.md`

---

## 2) Goals
- UI в `/cabinet/settings/` (или аналог в IA) для согласий.
- экспорт: JSON/ZIP со структурой (без сторонних секретов).
- удаление: soft-delete + фоновые очистки P2 (диари/анкеты/UGC) + отвязка Telegram.

---

## 3) AC
- [ ] AC-1 Пользователь может скачать свои данные.
- [ ] AC-2 Пользователь может удалить аккаунт; после удаления доступ закрыт.
- [ ] AC-3 Отзыв согласия “коммуникации” останавливает рассылки (email/TG).

---

## 6) Data model
- `users.status=deleted`, `deleted_at`
- каскадная очистка/анонимизация связанных данных:
  - diary_entries, intake_forms, leads (по политике), deep_links (по TTL)

---

## 7) API
- `POST /api/cabinet/data/export`
- `POST /api/cabinet/account/delete`
- `POST /api/cabinet/consents` (update)

---

## 8) Tracking
- `consent_updated` (consent_type, new_value)
- `account_deleted` (method=self_service)

---

## 9) Security/Privacy
- экспорт выдаётся только после re-auth (опционально) и фиксируется в audit log (admin экспорт тоже).
- не отправлять содержимое экспорта в логи.

---

## 12) Test plan
- integration: revoke consent stops communications flags.
- e2e: delete account → cannot login → data inaccessible.


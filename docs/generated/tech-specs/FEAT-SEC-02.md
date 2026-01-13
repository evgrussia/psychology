# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-SEC-02`  
**Epic:** `EPIC-11`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary
Шифрование P2 payload “в покое” для: анкеты booking, дневников, текстов UGC, OAuth токенов интеграций. Реализуем encryption service + ключи/ротацию (минимум) и запрет утечек в логи.

### Ссылки
- PRD: `docs/PRD.md` (NFR-SEC-2, Privacy constraints)
- Tracking: `docs/Tracking-Plan.md` (запреты)
- Data model: `docs/Модель-данных.md` (P2 поля)

---

## 2) Goals
- AES‑GCM (рекомендация) с random nonce, key from env/secret store,
- единый интерфейс `EncryptionService.encrypt/decrypt`,
- key versioning (минимум: `key_id` рядом с ciphertext).

---

## 3) AC
- [ ] AC-1 Все P2 поля в БД — ciphertext, не plaintext.
- [ ] AC-2 Дешифрование только в backend, только при наличии прав.
- [ ] AC-3 Логи редактируют ciphertext и не печатают plaintext.

---

## 6) Data model
Поля:
- `intake_forms.encrypted_payload`
- `diary_entries.encrypted_payload`
- `ugc_items.encrypted_content`, `ugc_answers.encrypted_text`
- `integrations_google_calendar.encrypted_refresh_token` и т.п.

---

## 12) Test plan
- unit: encrypt/decrypt roundtrip
- integration: попытка записать plaintext запрещена на уровне приложения.


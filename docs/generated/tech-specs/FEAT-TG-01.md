# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-TG-01`  
**Epic:** `EPIC-06`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~100k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем схему Telegram deep links: генерация `deep_link_id`, формирование ссылок для бота/канала, хранение mapping с TTL (без PII), чтобы склеивать web↔telegram и корректно запускать TG‑флоу.

### 1.3 Ссылки
- Telegram deep links: `docs/Telegram-Deep-Links-Schema.md`
- Tracking: `docs/Tracking-Plan.md` (`cta_tg_click`, `tg_subscribe_confirmed`)
- Архитектура: `docs/Архитектурный-обзор.md` (deep_link_id как shared kernel)

---

## 2) Goals
- **G1:** `deep_link_id` генерируется на стороне backend (или web с серверной фиксацией).
- **G2:** Payload не содержит PII/свободного текста.
- **G3:** TTL (например, 30 дней) + возможность дебага/склейки.

---

## 3) AC
- [ ] AC-1 Каждый TG‑CTA содержит `deep_link_id`.
- [ ] AC-2 В событии `cta_tg_click` есть `deep_link_id` + `tg_flow`.
- [ ] AC-3 TG сервис может декодировать payload и отправить `tg_subscribe_confirmed`.

---

## 5) Архитектура
- **Domain:** `DeepLink` (id + flow + meta).
- **Application:** `CreateDeepLinkUseCase`, `ResolveDeepLinkUseCase`.
- **Infrastructure:** repository + TTL cleanup job.

---

## 6) Data model
- `deep_links`:
  - `deep_link_id` (short id), `tg_flow`, `tg_target`, `topic`, `created_at`, `expires_at`
  - `anonymous_id` reference (optional) **только внутренний**, не уходит в TG.

P0 only.

---

## 7) API
| Endpoint | Method | Auth | Response |
|---|---:|---|---|
| `/api/public/deep-links` | POST | public | `{deep_link_id, url}` |
| `/api/telegram/deep-links/{id}` | GET | telegram-service | `{payload}` |

---

## 8) Tracking
- `cta_tg_click` (tg_target, tg_flow, deep_link_id)

---

## 12) Test plan
- unit: encode/decode payload
- integration: create deep link → resolve → TTL expiry


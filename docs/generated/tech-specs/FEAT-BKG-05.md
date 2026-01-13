# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-BKG-05`  
**Epic:** `EPIC-04`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~90k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем сценарий “нет слотов” как не‑тупик: страница `/booking/no-slots/` с вариантами “лист ожидания” (контакт + согласие на коммуникации) и “TG‑консьерж записи” (deep link в бот).

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-BKG-4..5)
- IA: `docs/information-architecture.md` (`/booking/no-slots/`)
- Domain model: `docs/Domain-Model-Specification.md` (WaitlistRequest)
- Tracking: `docs/Tracking-Plan.md` (`show_no_slots`, `waitlist_submitted`)
- Telegram: `docs/Telegram-Deep-Links-Schema.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** UI “нет слотов” появляется при пустом availability.
- **G2:** Waitlist: выбор preferred_contact (email/phone/telegram) + preferred_time_window.
- **G3:** Consent: коммуникации отдельно (см. SEC-01).
- **G4:** TG‑консьерж: CTA ведёт в бот с `tg_flow=concierge`.

### 2.2 Non-goals
- Автоматическое предложение альтернативных слотов (P1 `FEAT-BKG-11`).

---

## 3) Scope / AC
- [ ] AC-1 Показываем `show_no_slots` с `service_slug`.
- [ ] AC-2 Waitlist создаёт запись в БД и добавляет lead/timeline (CRM).
- [ ] AC-3 При отсутствии согласия на коммуникации waitlist не отправляется.

Негативные:
- пользователь не хочет оставлять контакт → предлагаем TG‑вариант.

---

## 5) Архитектура
- **Application:** `CreateWaitlistRequestUseCase`, `CreateOrUpdateLeadUseCase` (CRM).
- **Domain:** `WaitlistRequest`.
- **Infrastructure:** encryption для контакта (P1/P2 по трактовке), email sender (подтверждение).

---

## 6) Data model
- `waitlist_requests` (service_id, preferred_contact_method, encrypted_contact_value, preferred_time_window, status)
- `leads` / `lead_timeline_events` (без текста)

---

## 7) API
| Endpoint | Method | Auth | Назначение |
|---|---:|---|---|
| `/api/public/booking/no-slots` | GET | public | модель страницы (опционально) |
| `/api/public/waitlist` | POST | public | создать запрос |

---

## 8) Tracking
- `show_no_slots`
- `waitlist_submitted`
- `cta_tg_click` (`tg_flow=concierge`)

---

## 9) Security/Privacy
- контакт хранить шифрованно (P1, но защищаем).
- не отправлять контакт в аналитику.

---

## 12) Test plan
- e2e: нет слотов → submit waitlist → успех + события.


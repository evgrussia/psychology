# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-TG-02`  
**Epic:** `EPIC-06`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~200k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем Telegram‑бота (гибрид с каналом): онбординг (тема/частота), выдача “плана на 7 дней”/сохранение материалов, и “консьерж записи” (сервисный, без обсуждения терапии). Бот использует `deep_link_id` из `FEAT-TG-01` и отправляет измеримые события.

### 1.3 Ссылки
- Technical decisions: `docs/Technical-Decisions.md` (гибрид канал+бот)
- Telegram schema: `docs/Telegram-Deep-Links-Schema.md`
- Tracking: `docs/Tracking-Plan.md` (tg_* события + запреты по тексту)
- PRD: `docs/PRD.md` (FR-TG-1..5)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Старт по deep link: распознать `tg_flow` (plan_7d/save_resource/challenge_7d/concierge/question).
- **G2:** Онбординг: сегмент (topic) + частота; событие `tg_onboarding_completed`.
- **G3:** Минимальный retention: событие `tg_interaction` на кнопки/команды.
- **G4:** Stop/unsubscribe: `tg_series_stopped`.
- **G5:** Privacy: не хранить текст пользователя и не отправлять в аналитику; допускается `has_text=true` + `text_length_bucket`.

### 2.2 Non-goals
- AI‑агенты в Telegram.

---

## 3) Scope / AC
- [ ] AC-1 Бот стартует по deep link и корректно продолжает сценарий.
- [ ] AC-2 События tg отправляются (source=telegram) по Tracking Plan.
- [ ] AC-3 Пользователь может легко остановить серию.

Негативные:
- webhook TG недоступен → fallback polling (или наоборот), с логированием.

---

## 5) Архитектура
- отдельный сервис `apps/bot` (рекомендуется), либо модуль в backend.
- **Application:** `HandleTelegramUpdateUseCase`, `StartOnboardingUseCase`, `SendPlanMessageUseCase`.
- **Infrastructure:** Telegram Bot API client, template store (message_templates), scheduler (отложенные сообщения).

---

## 6) Data model
- `telegram_users` (optional): `telegram_user_id` (P1), связка с `user_id` (optional)
- `telegram_sessions/state` (conversation state) — хранить минимально
- `message_templates` (используется также email/templates)

PII: tg_id (P1) — не в аналитике.

---

## 7) API / Контракты
- endpoint для webhook TG: `/api/webhooks/telegram`
- внутренний API для создания deep links и выдачи материалов.

---

## 8) Tracking
По Tracking Plan:
- `tg_subscribe_confirmed` (tg_target, deep_link_id)
- `tg_onboarding_completed` (segment, frequency)
- `tg_interaction` (interaction_type, tg_flow, button_id?, deep_link_id?)
- `tg_series_stopped` (tg_flow, stop_method)

---

## 9) Security/Privacy
- не логировать update payload целиком (может содержать текст).
- хранить токен бота в секретах.

---

## 12) Test plan
- integration: обработка update (start, button click), отправка событий.
- e2e (ручной): пройти onboarding, получить 1 сообщение серии, нажать stop.


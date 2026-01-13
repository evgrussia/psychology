# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-ADM-06`  
**Epic:** `EPIC-08`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~200k токенов (≤ 270k)

---

## 1) Summary
Базовая аналитика в админке: раздел `/admin/analytics/` с воронками booking/TG/интерактивов и метриками no-show, на основе Tracking Plan и формул метрик.

### Ссылки
- Admin spec: `docs/Admin-Panel-Specification.md` (4.12)
- Tracking: `docs/Tracking-Plan.md`
- Формулы: `docs/Формулы-метрик.md`
- Observability: `FEAT-AN-01..02`

---

## 2) Goals
- funnels:
  - booking: start → slot_selected → paid → confirmed
  - tg: cta → subscribe → onboarding
  - interactive: start → complete → cta/booking
- фильтры по периоду и срезам (topic, service_slug, tg_flow).

---

## 3) AC
- [ ] AC-1 Дашборды работают без PII и без текстов.
- [ ] AC-2 Кэширование тяжёлых запросов (TTL 5–15 минут).

---

## 6) Data model
Варианты реализации:
- хранить P0 events в `analytics_events` в Postgres (self-hosted),
- либо проксировать из внешней аналитики (Amplitude/Mixpanel) — тогда в админке только агрегаты.

Для релиза 1 рекомендуется self-hosted P0 events для полной управляемости и privacy.

---

## 7) API
- `GET /api/admin/analytics/funnels/booking?range=...`
- `GET /api/admin/analytics/funnels/telegram?...`
- `GET /api/admin/analytics/funnels/interactive?...`
- `GET /api/admin/analytics/no-show?...`

---

## 12) Test plan
- integration: расчёт конверсий по тестовым событиям.


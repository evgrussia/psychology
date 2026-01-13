# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-TG-03`  
**Epic:** `EPIC-06`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~60k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Настраиваем связку с Telegram‑каналом: CTA на сайте ведёт в канал/бот, обеспечиваем измеримость подписки настолько, насколько позволяет Telegram (через подтверждение в боте).

### 1.3 Ссылки
- Technical decisions: `docs/Technical-Decisions.md` (канал+бот)
- Tracking: `docs/Tracking-Plan.md` (`cta_tg_click`, `tg_subscribe_confirmed`)

---

## 2) Goals
- **G1:** CTA “подписаться на канал” формирует deep link (`tg_target=channel`).
- **G2:** Измеримость: после перехода в канал пользователь возвращается в бота и нажимает “Готово/Я подписался(ась)” → `tg_subscribe_confirmed`.

---

## 3) AC
- [ ] AC-1 `cta_tg_click` есть для channel.
- [ ] AC-2 `tg_subscribe_confirmed` фиксируется через бота (best effort).

---

## 5) Архитектура
- Реализуется в `apps/bot`: сценарий подтверждения подписки на канал.

---

## 8) Tracking
- `cta_tg_click` (tg_target=channel)
- `tg_subscribe_confirmed` (tg_target=channel)

---

## 12) Test plan
- ручной: CTA на сайте → открыть канал → вернуться в бота → подтвердить → событие.


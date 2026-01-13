# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-AN-11`  
**Epic:** `EPIC-10`  
**Приоритет:** P1  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~180k токенов (≤ 270k)

---

## 1) Summary
Детальная аналитика интерактивов: воронка по вопросам/шагам (где отваливаются) и распределения выборов **только по ID**, без текстов и без чувствительных ответов.

### Ссылки
- Roadmap: `docs/Roadmap-Backlog.md` (P1)
- Tracking: `docs/Tracking-Plan.md` (navigator_step_completed и принципы запретов)
- Technical decisions: `docs/Technical-Decisions.md` (детализация — P1)

---

## 2) Goals
- для квизов: `question_index` + `abandoned_at_question` (без ответов),
- для навигатора: `step_index` + `choice_id`,
- дашборд в админке `/admin/analytics/interactive/` с воронкой.

---

## 9) Privacy
Запрещено отправлять тексты вопросов/вариантов и значения шкал; только ID/индексы/агрегаты.


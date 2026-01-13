# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-INT-06`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~80k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем кризисный режим (guardrail) для интерактивов и UGC: при триггерах показываем экстренную помощь, меняем приоритет CTA (без “прогрева”), фиксируем события `crisis_banner_shown`/`crisis_help_click`.

### 1.3 Ссылки
- PRD: `docs/PRD.md` (FR-INT-4, Constraints)
- Tracking: `docs/Tracking-Plan.md` (crisis events)
- UGC rules: `docs/UGC-Moderation-Rules.md`
- IA: `docs/information-architecture.md` (`/emergency/`)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Единый UI компонент `CrisisBanner` (web) с действиями: `call_112`, `hotline`, `tell_someone`, `back_to_resources`.
- **G2:** Поверхности:
  - интерактивы (quiz/navigator/thermometer/scripts),
  - “анонимный вопрос” (премодерация/блокировка отправки при высоком риске).
- **G3:** Не собирать текст причин; только категория `trigger_type`.

### 2.2 Non-goals
- Автоматическое “распознавание” текста на клиенте по ML. Только словари/категории (если вообще нужен текст — см. MOD-01).

---

## 3) Scope / AC
- [ ] AC-1 При кризисном триггере CTA “Запись/Telegram” не является primary.
- [ ] AC-2 События кризиса содержат только категорию и surface.
- [ ] AC-3 `/emergency/` доступна всегда.

Негативные:
- триггер сработал ошибочно → пользователь может “вернуться к ресурсам” (без давления).

---

## 4) UX / UI
- компонент кризисного блока в дизайне, доступен и скринридеру.

---

## 5) Архитектура
- **Domain:** `CrisisTriggerType` (enum/categories).
- **Application:** `EvaluateCrisisTriggerUseCase` (если есть централизованно) либо локальная логика по правилам интерактива.
- **Infrastructure:** источник словаря/правил (конфиг, admin editable в будущем).

---

## 6) Data model
Если сохраняем факт кризиса:
- в `interactive_runs`: `crisis_triggered`, `crisis_trigger_type`.
- в `ugc_items`: `has_crisis_trigger` + категории триггеров (без текста).

---

## 7) API
Не требуется отдельного API (кроме как в `MOD-01` для флагов).

---

## 8) Tracking
По Tracking Plan:
- `crisis_banner_shown` (trigger_type, surface)
- `crisis_help_click` (action)

---

## 9) Security/Privacy
- никакого текста в событиях/логах.

---

## 12) Test plan
- e2e: искусственно вызвать trigger → баннер показан → клики трекаются.
- privacy: payload без текстов.


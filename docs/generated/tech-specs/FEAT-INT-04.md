# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-INT-04`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~120k токенов (≤ 270k)

---

## 1) Summary

### 1.1 Что делаем
Реализуем интерактив BND‑01 “Скрипты границ”: выбор сценария/стиля/цели → показ 3–6 вариантов фраз + безопасный блок “что делать, если давят”. Тексты и варианты управляются через админку.

### 1.3 Ссылки
- Interactive matrix: `docs/Interactive-Modules-Matrix.md` (BND‑01)
- Tracking: `docs/Tracking-Plan.md` (`boundaries_script_*`)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.5.5)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** UI выбора: `scenario` (work/family/partner/friends/other), `tone` (soft/short/firm), `goal` (refuse/ask/help/rule/pause).
- **G2:** Результат: 3–6 вариантов, каждый имеет `variant_id`.
- **G3:** Копирование варианта фиксируется (`boundaries_script_copied`) без текста.
- **G4:** Если сценарий связан с небезопасностью/насилием → кризисный блок (см. INT-06).

### 2.2 Non-goals
- Генерация текста AI (P2).

---

## 3) Scope / AC
- [ ] AC-1 В события не попадает текст фраз.
- [ ] AC-2 Варианты редактируются в админке и имеют стабильные `variant_id`.
- [ ] AC-3 Есть кнопка “Скопировать”, работает на mobile/desktop.

Негативные:
- нет вариантов в выбранной комбинации → показать альтернативы (сменить стиль/цель).

---

## 4) UX / UI
- Маршруты: `/start/boundaries-scripts/` (IA).
- Состояния: selection → variants → copied toast.
- A11y: aria-live для toast, фокус на кнопках.

---

## 5) Архитектура
- **Application:** `GetBoundaryScriptsUseCase`, `RecordScriptInteractionUseCase`.
- **Domain:** `BoundaryScriptMatrix` (definition), `ScriptVariant`.
- **Infrastructure:** хранение definitions как JSONB (interactive_definitions type `boundaries_script`) + published version.

---

## 6) Data model
- `interactive_definitions` (BND‑01) definition_json:
  - scenarios/styles/goals
  - variants: `{variant_id,text}`
  - safety block texts + trigger flags
- `interactive_runs`: optional (можно сохранять run агрегаты “использовал скрипты”).

P0.

---

## 7) API
Public:
- `GET /api/public/boundaries-scripts/{slug}` → definition

Tracking events — на web.

---

## 8) Tracking
По Tracking Plan:
- `boundaries_script_start` (scenario,tone)
- `boundaries_script_variant_viewed` (variant_id)
- `boundaries_script_copied` (variant_id)

---

## 9) Security/Privacy
- не логировать текст фраз, даже в errors.

---

## 12) Test plan
- unit: stable variant_id, mapping selection→variants
- e2e: выбрать → скопировать → проверить событие без текста


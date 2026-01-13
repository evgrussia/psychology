# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-INT-03`  
**Epic:** `EPIC-03`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~180k токенов (≤ 270k)

---

## 1) Summary (коротко)

### 1.1 Что делаем
Реализуем NAV‑01 “Навигатор состояния” — ветвящийся сценарий 6–10 шагов с итоговым `result_profile` и планом действий. В релиз 1 структура ветвления фиксирована (без визуального редактора), но тексты/результаты редактируются в админке.

### 1.2 Почему сейчас
- **Сигнал/боль:** это “уникальный интерактив” из PRD/матрицы и ключ к time-to-benefit.
- **Ожидаемый эффект:** вовлечение и мягкая конверсия в TG/booking.
- **Если не сделать:** теряем дифференциацию продукта.

### 1.3 Ссылки
- Interactive matrix: `docs/Interactive-Modules-Matrix.md` (NAV‑01)
- Technical decisions: `docs/Technical-Decisions.md` (визуальный редактор NAV — P1)
- Tracking: `docs/Tracking-Plan.md` (`navigator_*`)
- Admin spec: `docs/Admin-Panel-Specification.md` (4.5.3)

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** NAV‑01: 6–10 шагов, выборы 2–4 варианта, финал с `result_profile`.
- **G2:** Трекинг: `navigator_start`, `navigator_step_completed`, `navigator_complete`.
- **G3:** Кризисные триггеры на любом шаге → кризисный режим (см. `FEAT-INT-06`).
- **G4:** Админка редактирует тексты шагов/карточек/профилей (без изменения связей).

### 2.2 Non-goals
- Визуальный редактор структуры (P1, `FEAT-INT-11`).

---

## 3) Scope

### 3.1 In-scope
- прохождение nav, сохранение агрегатов (`result_profile`, `duration_ms`),
- CTA после результата (TG/booking).

### 3.3 Acceptance criteria
- [ ] AC-1 Навигатор не требует ввода контакта.
- [ ] AC-2 В аналитике нет текстов выборов (только `choice_id`).
- [ ] AC-3 Изменение текста в админке отражается в UI без релиза.

### 3.4 Негативные сценарии
- **NS-1:** Не найден definition → показываем fallback “С чего начать”.
- **NS-2:** Битая структура (невалидные next_step_id) → валидатор при публикации.

---

## 4) UX / UI
- Маршруты: `/start/navigator/` и/или `/interactive/navigator/` (IA).
- Состояния: step, back, result.
- A11y: радиокнопки/кнопки выбора, фокус.

---

## 5) Архитектура (Clean Architecture)

### 5.1 Компоненты/модули
- **Presentation:** NavigatorRunner UI.
- **Application:** `GetNavigatorDefinitionUseCase`, `ValidateNavigatorDefinitionUseCase`.
- **Domain:** `NavigatorDefinition` (дерево шагов), `ResultProfile`.
- **Infrastructure:** хранение definition как JSONB + published version.

### 5.2 Use cases (сигнатуры)
- `GetNavigatorDefinitionUseCase.execute({ slug }): { definition }`

---

## 6) Модель данных и миграции
- `interactive_definitions` (`type=navigator`, `slug=NAV-01`) + `definition_json`:
  - steps: `{step_id, question_text, choices[{choice_id,text,next_step_id}], crisis_trigger?}`
  - result_profiles: predefined ids (`stabilize_now|restore_energy|boundaries|clarify|support_contact`)
- `interactive_runs`: сохраняем `result_profile`, `duration_ms`, `crisis_triggered`.

P0 only.

---

## 7) API / Контракты
Public:
- `GET /api/public/navigators/{slug}` → published definition

Admin (в рамках `FEAT-ADM-03`):
- `PUT /api/admin/interactive/navigators/{id}` (тексты)
- `POST /publish`

---

## 8) Tracking / Analytics
По `docs/Tracking-Plan.md`:
- `navigator_start` (navigator_slug)
- `navigator_step_completed` (step_index, choice_id)
- `navigator_complete` (result_profile, duration_ms)

---

## 9) Security / Privacy
- choice текст не отправлять, только `choice_id`.

---

## 10) Надёжность, деградации
- если definition недоступен → fallback.

---

## 11) Rollout plan
- `navigator_enabled` (stage → prod)

---

## 12) Test plan
- unit: валидатор графа (acyclic/terminating, существование next ids)
- e2e: пройти NAV, убедиться в событиях и отсутствии текста в payload.

---

## 13) Open questions / решения
- [ ] Финальная структура NAV‑01 (шаги/ветки) подтверждается контентом; в релиз 1 можно хардкодить связи, редактировать тексты.


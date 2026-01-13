# Техническая спецификация фичи (Tech Spec)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-07  
**Статус:** draft  

**Feature ID:** `FEAT-A11Y-01`  
**Epic:** `EPIC-12`  
**Приоритет:** P0  
**Трекер:** —  

**Оценка реализации агентом Cursor:** ~200k токенов (≤ 270k, кросс‑срез → см. slices)

---

## 1) Summary
Доводим ключевые сценарии до WCAG 2.2 AA: клавиатура, видимый фокус, контраст, семантика/ARIA, формы (анкета/согласия/оплата), модалки/аккордеоны, skip-link.

### Ссылки
- A11y requirements: `docs/Accessibility-A11y-Requirements.md`
- PRD: `docs/PRD.md` (NFR-A11Y-1)
- UI Kit: `docs/UI-Kit-Design-System.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Skip-link на всех публичных страницах.
- **G2:** Полная клавиатурная навигация (Tab/Shift+Tab/Enter/Space/Esc).
- **G3:** Видимый фокус (`:focus-visible`, 3px+ outline).
- **G4:** Формы: label, aria-invalid, aria-describedby, error summary.
- **G5:** Динамика: корректные live regions для ошибок/статусов (“нет слотов”, “ошибка оплаты”).

### 2.2 Non-goals
- Полный аудит “всех страниц” за пределами релизных сценариев (но базовые компоненты должны быть доступными по умолчанию).

---

## 3) Scope / AC
- [ ] AC-1 Интерактивы (quiz/nav/trm/bnd/rituals) полностью управляются с клавиатуры.
- [ ] AC-2 Booking флоу соответствует разделу “Формы” из a11y требований.
- [ ] AC-3 FAQ/аккордеоны имеют `aria-expanded`/`aria-controls`.

---

## 10) Надёжность, производительность, деградации
A11y проверки не должны ухудшать LCP (минимум JS, SSR/SSG).

---

## 12) Test plan
- axe/lighthouse smoke на ключевых страницах,
- ручной сценарий “только клавиатура” (по чеклисту из a11y документа),
- проверка контраста (WebAIM).

---

## Appendix: Implementation slices (чтобы уложиться в контекст)

1. **Slice A (~70k):** базовые компоненты: skip-link, focus styles, accordion/menu/dialog patterns.
2. **Slice B (~70k):** интерактивы: формы/выборы/результаты + live regions.
3. **Slice C (~60k):** booking: анкета/согласия/оплата/ошибки + error summary.


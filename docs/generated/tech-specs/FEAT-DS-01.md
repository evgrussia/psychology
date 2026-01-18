# Tech Spec: FEAT-DS-01 — Приведение `apps/web` к Design System

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-17  
**Статус:** draft  

**Feature ID:** `FEAT-DS-01`  
**Epic:** `EPIC-00 — Platform & Foundations` (кросс-срез)  
**Приоритет:** P0 (технический долг, влияет на консистентность UI и темы)  
**Трекер:** n/a  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Приводим весь текущий UI в `apps/web` к правилам дизайн‑системы `@psychology/design-system`: **никакого хардкода стилей**, только **компоненты дизайн‑системы**, **Tailwind‑классы на семантических токенах** и/или **CSS‑переменные из `design-system/src/styles/theme.css`**.

### 1.2 Почему сейчас
- **Сигнал/боль:** часть страниц использует inline styles и хардкод палитры (`#...`, `rgba(...)`) → визуальная неконсистентность, проблемы с dark theme, сложная поддержка.
- **Ожидаемый эффект:** единый внешний вид, корректная поддержка light/dark, меньше регрессов и быстрее разработка.
- **Если не сделать:** любое изменение темы/токенов будет “не долетать” до страниц с хардкодом; UI будет расползаться.

### 1.3 Ссылки на первоисточники
- Design System rules: `docs/UI-Kit-Design-System.md`
- Design tokens (source of truth): `design-system/src/styles/theme.css`
- DS styles entrypoint: `@psychology/design-system/styles.css` (экспорт из `design-system/dist/design-system.css`)

---

## 2) Goals / Non-goals

### 2.1 Goals (что обязательно)
- **G1:** Удалить inline styles и JS‑манипуляции стилями (`onMouseEnter` → `e.currentTarget.style...`) из `apps/web` (за исключением редких технических кейсов, явно описанных в allowlist).
- **G2:** Убрать хардкод цветов (`#...`, `rgb/rgba/hsl`) и заменить на семантические токены (`bg-background`, `text-foreground`, `border-border`, `text-primary`, и т.д.).
- **G3:** Привести страницы контента (blog/resources/glossary) к компонентам дизайн‑системы (Card/Badge/Button/Container/Section) и единым состояниям (hover/focus/empty/error).
- **G4:** Привести `SafeMarkdownRenderer` к визуальному стилю дизайн‑системы (Alert/typography/tokens), чтобы ошибки/empty выглядили консистентно и поддерживали `.dark`.
- **G5:** Добавить guardrails: автоматическая проверка (lint/CI) на регресс (возврат inline styles/hex colors).

### 2.2 Non-goals (что осознанно НЕ делаем)
- **NG1:** Полный редизайн/изменение UX, тексты или IA. Цель — **перевести существующее** на дизайн‑систему без ломки смысла и флоу.
- **NG2:** Переписывание дизайн‑системы. Источник истины — `design-system/`; фича про выравнивание `apps/web`.
- **NG3:** Введение нового глобального CSS (кроме минимальных правок в `apps/web/src/app/globals.css`, если необходимо для устранения конфликтов с DS).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope (конкретные сценарии)
- **US-1:** Пользователь открывает `/blog` → видит список статей, состояние empty/error оформлено через DS.
- **US-2:** Пользователь открывает `/resources` → карточки ресурсов оформлены через DS.
- **US-3:** Пользователь открывает `/glossary` и `/glossary/[slug]` → вся типографика/карточки/бейджи/CTA оформлены через DS.
- **US-4:** В markdown‑контенте (body) и fallback‑сообщениях используются семантические стили DS, а не хардкод.
- **US-5:** Темизация: переключение `.dark` корректно меняет вид перечисленных страниц без “слепых зон”.

### 3.2 Out-of-scope
- Админ‑панель (`apps/admin`) — отдельной фичей, если потребуется.
- Внедрение полноценных visual regression тестов (опционально, P1).

### 3.3 Acceptance criteria (AC)
- [ ] **AC-1:** В `apps/web/src/app/blog/page.tsx` нет `style={{...}}`, нет `#...`/`rgba(...)`; UI собран из DS компонентов/семантических классов.
- [ ] **AC-2:** В `apps/web/src/app/resources/page.tsx` нет `style={{...}}`, нет `#...`/`rgba(...)`; UI собран из DS компонентов/семантических классов.
- [ ] **AC-3:** В `apps/web/src/app/glossary/page.tsx` и `apps/web/src/app/glossary/[slug]/page.tsx` нет inline styles/JS‑правок стилей; карточки/бейджи/CTA и типографика — через DS.
- [ ] **AC-4:** `apps/web/src/components/SafeMarkdownRenderer.tsx` не содержит хардкода цветов; ошибки/предупреждения показываются через DS (например `Alert`) или семантические токены.
- [ ] **AC-5:** Добавлен “guardrail” (линт/скрипт/CI), который падает при появлении:
  - `style={{` в `apps/web/src/app/**` (кроме allowlist),
  - hex/rgb(a)/hsl(a) цветовых литералов в `apps/web/src/**` (кроме allowlist).
- [ ] **AC-6:** Smoke: light/dark переключение темы не ломает читабельность (контраст/фон/текст) на перечисленных страницах.

### 3.4 Негативные сценарии (обязательные)
- **NS-1:** API недоступен/таймаут → страницы показывают DS‑empty/error state (без хардкода).
- **NS-2:** Пустые списки (нет контента) → DS‑empty state.

---

## 4) UX / UI (что увидит пользователь)

### 4.1 Изменения экранов/страниц
**Маршруты/страницы:**
- `/blog`
- `/resources`
- `/glossary`
- `/glossary/[slug]`

**Состояния UI:**
- loading (если появится в клиентской части) — через DS `Skeleton`/`Spinner` (или существующий паттерн)
- empty — через DS `Card` + текст `text-muted-foreground`
- error — через DS `Alert` (variant: warning/destructive) или DS `Disclaimer` (если семантически подходит)

### 4.2 A11y (минимум)
- [ ] Не ухудшить клавиатурную навигацию (особенно cards/links).
- [ ] Использовать `focus-visible` состояния (дизайн‑система уже задаёт базовый ring).
- [ ] Ссылки/кнопки — корректные роли (не делать “ссылку как div”).
- [ ] Контраст в light/dark соответствует WCAG 2.2 AA на уровне токенов.

---

## 5) Архитектура (frontend)

### 5.1 Компоненты/модули
- **Design System:** `@psychology/design-system` (компоненты + токены; стили импортируются один раз в `apps/web/src/app/layout.tsx`)
- **Web app:** `apps/web` использует DS компоненты и tailwind‑классы с семантическими токенами (`bg-background`, `text-foreground`, и т.п.)

### 5.2 Принцип: “No hardcoded styles”
Допустимые способы стилизации:
- Tailwind‑классы, завязанные на DS токены.
- Inline style **только** для:
  - CSS переменных (например `style={{ '--x': value } as React.CSSProperties }`),
  - редко: размеры/позиционирование из данных, когда это невозможно выразить классами,
  - и только если добавлено в allowlist проверки.

Запрещено:
- inline `style={{ color: '#...' }}` и любые `#...`/`rgb(...)` литералы в UI.
- JS‑манипуляции DOM‑стилей в hover/focus (`e.currentTarget.style...`) — заменить на `hover:*`/`focus-visible:*`.

---

## 6) Инвентаризация текущих нарушений (baseline на 2026-01-17)

### 6.1 Страницы с inline styles / хардкодом
- `apps/web/src/app/blog/page.tsx` — inline styles, hover через JS, hex colors.
- `apps/web/src/app/resources/page.tsx` — inline styles, rgba box-shadow, hex colors.
- `apps/web/src/app/glossary/page.tsx` — массивный inline styles, JS hover/focus, hex colors.
- `apps/web/src/app/glossary/[slug]/page.tsx` — inline styles, JS hover/focus, hex colors.
- `apps/web/src/components/SafeMarkdownRenderer.tsx` — inline styles с warning‑палитрой и нейтральными фонами.

### 6.2 Возможные “мягкие” конфликты глобальных стилей
- `apps/web/src/app/globals.css` задаёт `font-family: var(--font-sans)` и `@theme` переменные — нужно проверить, не противоречит ли это DS `--font-family` и базовым стилям DS.
  - Решение должно оставить **один источник истины** для базовой типографики.

---

## 7) План реализации (по шагам)

### 7.1 Slice A — Миграция контентных страниц (P0)
**Цель:** убрать хардкод, собрать UI на DS.

- **A1:** `apps/web/src/app/blog/page.tsx`
  - Container/layout → DS `Container` + `Section`
  - список → DS `Card` (клик целиком через `Link` внутри) + `Separator`
  - заголовки/текст → классы `text-foreground`, `text-muted-foreground`
  - hover заголовка → `hover:text-primary`

- **A2:** `apps/web/src/app/resources/page.tsx`
  - grid → tailwind `grid` + DS `Card`
  - тени → `shadow-*`/DS elevation (если есть utility) вместо `rgba(...)`
  - tags/format → DS `Badge`

- **A3:** `apps/web/src/app/glossary/page.tsx`
  - sticky letter header → tailwind + токены (`text-primary`, `bg-background/..` при необходимости)
  - карточки терминов → DS `Card` + `Link` + `Badge`
  - focus ring → полагаться на DS `*:focus-visible`, без JS‑outline

- **A4:** `apps/web/src/app/glossary/[slug]/page.tsx`
  - breadcrumb link → `Button variant="link"` или обычный `Link` с `text-primary hover:underline`
  - category pill → DS `Badge`
  - CTA “Подобрать психолога” → DS `Button` (asChild) вместо inline Link‑button
  - related content cards → DS `Card`

### 7.2 Slice B — `SafeMarkdownRenderer` (P0)
**Цель:** ошибки/фоллбеки в стиле DS и без хардкода.
- заменить “жёлтый алерт” на DS `Alert` (например variant `warning`), либо собрать на токенах:
  - фон: `bg-warning/??` (если предусмотрено) или `bg-muted`
  - border: `border-border`
  - текст: `text-foreground` + “warning” акцент через токены
- убедиться, что блок `details/pre` читабелен в dark (через `bg-muted`, `text-muted-foreground`, `border-border`)

### 7.3 Slice C — Guardrails (P0)
**Вариант 1 (быстро):** добавить скрипт в `apps/web` (node) и запускать в CI:
- fail если найдено `style={{` в `apps/web/src/app/**` (кроме allowlist)
- fail если найдены цветовые литералы: `#[0-9a-fA-F]{3,8}`, `rgb(a)?(`, `hsl(a)?(`

**Вариант 2 (строже):** eslint rule (кастомная) на запрещённые паттерны.

Результат: регресс “вернулся хардкод” ловится до мержа.

---

## 8) Tracking / Analytics
Изменения визуальные; событий/props добавлять не требуется. Важно не сломать существующий tracking на страницах (если есть клиентские компоненты).

---

## 9) Security / Privacy
Не добавлять PII/свободный текст в аналитику/ошибки. `SafeMarkdownRenderer` не должен логировать содержимое markdown целиком в проде (если сейчас логирует — оценить необходимость; не блокер этой спеки, но отметить как follow-up).

---

## 10) Надёжность, производительность, деградации
- При ошибках API использовать существующие fallback, но визуально оформить через DS.
- Не ухудшить LCP/CLS (особенно на `/glossary/[slug]` — большие заголовки/блоки).

---

## 11) Rollout plan
Без фича‑флага: изменения должны быть обратимы через git revert. Рекомендуется мерджить по slices (A → B → C).

---

## 12) Test plan

### 12.1 Unit tests
Не требуется (изменения в основном стилевые/разметка), если не меняем логику.

### 12.2 Integration tests
Не требуется.

### 12.3 E2E (критические happy paths)
- `/blog` открывается, список кликабелен (переход на `/blog/[slug]`).
- `/resources` открывается, карточка кликабельна.
- `/glossary` открывается, карточка термина кликабельна.
- `/glossary/[slug]` открывается, CTA виден и кликабелен.

### 12.4 A11y smoke
- keyboard tab по cards/CTA, видимый focus.
- проверка контраста в `.dark` (визуально + axe smoke при наличии).

### 12.5 Guardrail проверки (локально/CI)
Рекомендуемые проверки (пример):
- скан `apps/web/src` на `style={{`
- скан `apps/web/src` на `#[0-9a-fA-F]{3,8}` и `rgb(a)?(` / `hsl(a)?(`

---

## 13) Open questions / решения

### 13.1 Вопросы
- [ ] Q1: Нужен ли единый типографический слой для markdown (prose) внутри DS? (если да — добавить DS компонент/класс, но это NG этой спеки)
- [ ] Q2: Нужно ли включать `apps/admin` в тот же guardrail (второй этап)?

### 13.2 Decision log
- **2026-01-17:** Источник истины по токенам — `design-system/src/styles/theme.css`. Любые значения “как в макете” должны выражаться через токены/компоненты.


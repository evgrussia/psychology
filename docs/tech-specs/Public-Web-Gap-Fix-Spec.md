# Техническая спецификация: доработка EPIC-01 (Public Web)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Epic:** `EPIC-01`  
**Приоритет:** P0  
**Трекер:** TBD  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Закрываем оставшиеся несоответствия EPIC-01:
- **FEAT-WEB-01 (Главная):** включаем `homepage_v1_enabled`, добавляем явный fallback “первый шаг” при отсутствии интерактивов, отображаем empty/error состояния ключевых блоков и выравниваем трекинг CTA.
- **FEAT-WEB-02 (Trust pages):** приводим фича‑флаг `trust_pages_v1_enabled` к поведению “вся страница отключена/включена”.
- **FEAT-WEB-03 (Legal/Disclaimer):** гарантируем отображение дисклеймера на всех шагах booking и всех интерактивных маршрутах `/start/*`.

### 1.2 Почему сейчас
- **Сигнал/боль:** текущая реализация частично расходится со спеками EPIC‑01 и acceptance criteria.
- **Ожидаемый эффект:** единое поведение фича‑флагов, предсказуемый UX при отсутствии контента, соблюдение требований к дисклеймерам.
- **Если не сделать:** риски несоответствия релизному чеклисту и регрессии доверия/комплаенса.

### 1.3 Ссылки на первоисточники
- `docs/generated/tech-specs/FEAT-WEB-01.md`
- `docs/generated/tech-specs/FEAT-WEB-02.md`
- `docs/generated/tech-specs/FEAT-WEB-03.md`
- `docs/Tracking-Plan.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** Главная страница реагирует на `homepage_v1_enabled` (полное отключение/включение).
- **G2:** При отсутствии интерактивов показывается явный “первый шаг” (статический fallback) с переходом в `/start/*`.
- **G3:** Есть ясные empty/error состояния для блоков, зависящих от API (topics/featured/trust).
- **G4:** Все CTA на главной трекаются единообразно (`cta_click`), при этом Telegram‑CTA сохраняет `cta_tg_click` для текущих воронок.
- **G5:** `trust_pages_v1_enabled` управляет доступностью страниц `/about` и `/how-it-works`.
- **G6:** Дисклеймер присутствует на всех этапах booking и всех интерактивных маршрутах `/start/*`.

### 2.2 Non-goals
- **NG1:** Переписывание контента страниц или копирайтинга.
- **NG2:** Полная переделка системы feature flags.
- **NG3:** Внедрение новой аналитической платформы.

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US-1:** Если `homepage_v1_enabled = false`, пользователь не видит обновлённую главную (redirect/404/минимальная заглушка).
- **US-2:** При пустых `featured_interactives` пользователь всё равно получает “первый шаг” (CTA на `/start`).
- **US-3:** Любой CTA на главной фиксируется `cta_click` с корректным `cta_target`.
- **US-4:** Если `trust_pages_v1_enabled = false`, `/about` и `/how-it-works` недоступны.
- **US-5:** Любая страница `/booking/*` содержит дисклеймер о неэкстренной помощи.
- **US-6:** Любая страница `/start/*` содержит дисклеймер о неэкстренной помощи и ссылку на `/emergency`.

### 3.2 Out-of-scope
- Добавление новых страниц или интерактивов.
- Изменение API контрактов.

### 3.3 Acceptance criteria
- [ ] При `homepage_v1_enabled = false` маршрут `/` не показывает основной контент (выбран единый вариант: redirect/404/заглушка).
- [ ] При пустом `featured_interactives` на `/` отображается “Первый шаг” с CTA на `/start`.
- [ ] Для Telegram‑CTA отправляются события `cta_click` (с `cta_target=telegram`) и `cta_tg_click`.
- [ ] При `trust_pages_v1_enabled = false` страницы `/about` и `/how-it-works` недоступны.
- [ ] На всех шагах booking (`/booking/*`) отображается `Disclaimer` с текстом о неэкстренной помощи.
- [ ] На всех интерактивных страницах `/start/*` отображается `Disclaimer` с ссылкой на `/emergency`.

### 3.4 Негативные сценарии
- **NS-1:** API не вернул topics/featured/trust → показывается empty/error состояние с CTA на booking/start.
- **NS-2:** Фича‑флаг выключен → пользователь не попадает на отключённые страницы.

---

## 4) Архитектура и ответственность слоёв

### 4.1 Компоненты/модули
- **Presentation (web):**
  - `apps/web/src/app/page.tsx`, `apps/web/src/app/HomeClient.tsx`
  - `apps/web/src/app/about/page.tsx`, `apps/web/src/app/how-it-works/page.tsx`
  - `apps/web/src/app/booking/*`
  - `apps/web/src/app/start/*` (или общий layout для start)
- **Shared UI:** `design-system/src/components/shared/disclaimer.tsx`
- **Feature flags:** `apps/web/src/lib/feature-flags.ts`

### 4.2 Предлагаемое решение (high-level)
- Ввести общий guard для `homepage_v1_enabled`.
- Добавить явный `HomepageFallback` блок (first step + CTA).
- В `HomeClient` унифицировать трекинг CTA.
- Для trust‑страниц добавить guard по `trust_pages_v1_enabled` на уровне `page.tsx`.
- Для `/start/*` добавить общий layout с `Disclaimer`, чтобы не дублировать в каждом маршруте.
- Для `/booking/*` добавить `Disclaimer` в `BookingStepLayout` (и при необходимости в entry‑step).

---

## 5) UX / UI

### 5.1 Главная
- При пустых данных показываем явный “Первый шаг” с CTA: “Начать с практик” → `/start`.
- Для empty/error состояния показываем мягкий текст + CTA “Записаться” и “Перейти к практикам”.

### 5.2 Trust pages
- При отключённом флаге пользователь получает 404 или redirect на `/`.

### 5.3 Booking и интерактивы
- Дисклеймер нейтрального тона (variant="info") + ссылка на `/emergency`.

---

## 6) Tracking / Analytics

- Для всех CTA главной фиксируем `cta_click`:
  - `cta_id`, `cta_label` (если есть), `cta_target`.
- Для Telegram‑CTA дополнительно отправляем `cta_tg_click` (без изменения текущей схемы Telegram).

---

## 7) Test plan

### 7.1 Unit tests
- Проверка guard по feature flags для `/about` и `/how-it-works`.
- Проверка формирования tracking‑payload для CTA (booking + telegram).

### 7.2 E2E
- `/` при пустых `featured_interactives` показывает fallback “Первый шаг”.
- `/about` и `/how-it-works` недоступны при `trust_pages_v1_enabled=false`.
- Любая страница `/start/*` содержит блок дисклеймера.
- Любая страница `/booking/*` содержит блок дисклеймера.

---

## 8) Open questions

- Какой тип поведения выбрать при выключенном `homepage_v1_enabled` и `trust_pages_v1_enabled`: 404, redirect на `/`, или заглушка?
- Нужен ли единый текст дисклеймера для booking и интерактивов, или допускаются локальные вариации?


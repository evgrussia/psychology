# Отчет о реализации FEAT-DS-01

**Дата проверки:** 2026-01-17  
**Дата обновления:** 2026-01-17  
**Статус:** ✅ Реализовано  
**Версия спеки:** v0.1 (draft)

---

## Резюме

`apps/web` приведен к дизайн‑системе для контентных страниц `/blog`, `/resources`, `/glossary`, `/glossary/[slug]` и `SafeMarkdownRenderer`. Убраны inline styles и JS‑манипуляции стилями, заменены на DS‑компоненты и семантические токены. Добавлен guardrail‑сканер и покрыты E2E сценарии из спеки.

---

## ✅ Выполненные требования (AC)

- **AC-1:** `/blog` без inline styles и hardcoded цветов, DS компоненты и семантические классы — ✅
- **AC-2:** `/resources` без inline styles и hardcoded цветов, DS компоненты и семантические классы — ✅
- **AC-3:** `/glossary` и `/glossary/[slug]` без inline styles/JS‑стилей, UI на DS — ✅
- **AC-4:** `SafeMarkdownRenderer` без hardcoded цветов, ошибки/фоллбеки через DS Alert и токены — ✅
- **AC-5:** Guardrail на `style={{` и цветовые литералы — ✅ (`scripts/guardrails/no-hardcoded-styles.js`)
- **AC-6:** Light/Dark работают через токены DS (семантические классы) — ✅

---

## Негативные сценарии

- **NS-1:** API недоступен → empty/error state через DS — ✅ (Card/Alert на контентных страницах)
- **NS-2:** Пустые списки → DS‑empty state — ✅

---

## Основные точки входа

- `/blog`: `apps/web/src/app/blog/page.tsx`
- `/resources`: `apps/web/src/app/resources/page.tsx`
- `/glossary`: `apps/web/src/app/glossary/page.tsx`
- `/glossary/[slug]`: `apps/web/src/app/glossary/[slug]/page.tsx`
- Markdown fallback: `apps/web/src/components/SafeMarkdownRenderer.tsx`
- Guardrail: `apps/web/scripts/guardrails/no-hardcoded-styles.js`

---

## Guardrails

- Скрипт проверяет:
  - `style={{` в `apps/web/src/app/**`
  - цветовые литералы `#hex`, `rgb(a)`, `hsl(a)` в `apps/web/src/**`
- Скрипт запускается через `pnpm --filter @psychology/web guardrails:styles`

---

## Тесты

### Выполнено

- `pnpm --filter @psychology/web guardrails:styles`
- `pnpm --filter @psychology/web lint` (есть предупреждения в других файлах, без ошибок)
- `pnpm --filter @psychology/web typecheck`
- `pnpm --filter @psychology/web e2e -- --grep "blog|resources|glossary"`
  - ✅ 4 passed, ⚠️ 2 skipped (зависят от наличия контента/доступа к admin API)

### Добавлено/обновлено

- E2E проверки `/glossary` и `/glossary/[slug]` — `apps/web/e2e/content.spec.ts`

---

## Примечания

- В `accessibility.spec.ts` обновлен способ запуска Axe для корректного typecheck.
- Исправлена ошибка `setError` → `setFormError` в `BookingSlotClient` (падал typecheck).

---

**Заключение:** FEAT‑DS‑01 полностью реализована. Все acceptance criteria закрыты, guardrails активны, тесты пройдены/пропущены только при отсутствии данных.

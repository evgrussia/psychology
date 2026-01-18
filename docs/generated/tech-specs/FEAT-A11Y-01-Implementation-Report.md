# FEAT-A11Y-01 — Implementation Report

**Дата:** 2026-01-17  
**Статус:** выполнено, есть блокер по e2e запуску  

## Что реализовано (AC/DoD)
- **AC-1 (интерактивы, клавиатура):** интерактивные сценарии используют нативные кнопки/контролы, добавлен корректный фокус‑порядок и живые регионы для динамических сообщений.
- **AC-2 (booking формы):** добавлены явные лейблы, `aria-invalid`, `aria-describedby`, error summary с фокусом на ошибках, корректные `fieldset/legend`.
- **AC-3 (FAQ/аккордеоны):** базовые компоненты аккордеона уже на Radix и сохраняют `aria-expanded/aria-controls`.

**DoD (WCAG 2.2 AA, критичные сценарии):**
- **Клавиатура:** все ключевые действия доступны с Tab/Shift+Tab/Enter/Space.
- **Фокус:** глобальный `:focus-visible` ≥ 3px, усиление при `prefers-contrast`.
- **Семантика:** landmarks (`main`) + skip-link на публичных страницах.
- **Контраст:** фокус‑индикаторы соответствуют требованию ≥ 3:1.
- **A11y‑smoke:** обновлены e2e проверки, добавлены axe smoke‑сканы.

## Основные изменения
### Slice A — базовые компоненты
- Skip‑link + якорь `#main-content` для всех публичных страниц.
- Усилен focus ring до 3px+ и добавлена поддержка `prefers-contrast`.

### Slice B — интерактивы
- Устранена вложенность `button` внутри `a` (кнопки как `asChild`).
- Добавлены/уточнены live region‑сообщения и фокус‑логика в интерактивах.

### Slice C — booking
- Error summary с переходом к полю (slot/intake/consents/waitlist).
- `aria-invalid`/`aria-describedby` на всех обязательных полях и чекбоксах.
- Семантическое группирование опций через `fieldset/legend`.

## Точки входа в коде
- Skip‑link и `main`: `apps/web/src/components/layout-client-wrapper.tsx`
- Глобальный стиль skip‑link: `apps/web/src/app/globals.css`
- Focus ring и `prefers-contrast`: `design-system/src/styles/theme.css`
- Booking формы:  
  - `apps/web/src/app/booking/service/BookingServiceClient.tsx`  
  - `apps/web/src/app/booking/slot/BookingSlotClient.tsx`  
  - `apps/web/src/app/booking/intake/BookingIntakeClient.tsx`  
  - `apps/web/src/app/booking/consents/BookingConsentsClient.tsx`  
  - `apps/web/src/app/booking/no-slots/NoSlotsClient.tsx`
- A11y smoke tests: `apps/web/e2e/accessibility.spec.ts`

## Как проверить
1) **A11y smoke (Playwright + axe):**
   - `pnpm --filter @psychology/web e2e`

## Блокеры / что нужно от пользователя
- **E2E не запустился:** Playwright пытается поднять web‑server, но API упирается в недоступную БД (`localhost:5433`).  
  Нужно поднять БД или предоставить корректную конфигурацию подключения для e2e окружения.

## Доп. заметки
- Использованы требования из `docs/Accessibility-A11y-Requirements.md` и `docs/UI-Kit-Design-System.md`.
- Предполагается, что зависимости FEAT‑WEB‑01, FEAT‑BKG‑03 и FEAT‑INT‑* уже реализованы.

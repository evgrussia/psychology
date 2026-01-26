# Визуальные спецификации — «Эмоциональный баланс»

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** ✅ Готово  
**Основано на:** Design System v1.0, все экраны реализованы

---

## 1) Обзор

Этот документ содержит визуальные спецификации для всех экранов Release 1. Все экраны сверстаны и готовы к использованию в разработке.

**Источник истины:** `design_system/src/app/components/ScreensWeb.tsx`

---

## 2) Design Tokens (применение)

### 2.1 Цветовая палитра

**Primary Actions:**
- Кнопки: `var(--primary)` (#17A2B8)
- Hover: `var(--primary)/90` (90% opacity)
- Text on Primary: `var(--primary-foreground)` (#FFFFFF)

**Semantic Colors:**
- Success: `var(--success)` (#0FA968)
- Warning: `var(--warning)` (#F59E42)
- Danger: `var(--danger)` (#E74C3C)
- Info: `var(--info)` (#17A2B8)

**Backgrounds:**
- Page: `var(--background)` (#F8FAFB light / #0F1419 dark)
- Cards: `var(--card)` (#FFFFFF light / #1A1F2E dark)

### 2.2 Typography

**Headings:**
- H1: 36px / 700 / Inter
- H2: 30px / 700 / Inter
- H3: 24px / 600 / Inter
- H4: 20px / 600 / Inter

**Body:**
- Large: 18px / 400 / Inter
- Base: 16px / 400 / Inter
- Small: 14px / 400 / Inter
- Caption: 12px / 400 / Inter

**Line Height:**
- Headings: 1.2
- Body: 1.5-1.75

### 2.3 Spacing

**Контейнеры:**
- Page padding (mobile): `var(--space-4)` (16px)
- Page padding (desktop): `var(--space-8)` (32px)
- Section spacing: `var(--space-12)` (48px)

**Компоненты:**
- Card padding: `var(--space-6)` (24px)
- Button padding: `var(--space-4)` (16px)
- Input padding: `var(--space-3)` (12px)

### 2.4 Border Radius

- Buttons: `var(--radius-md)` (12px)
- Cards: `var(--radius-lg)` (16px)
- Modals: `var(--radius-xl)` (24px)
- Badges/Tags: `var(--radius-sm)` (8px)

### 2.5 Shadows (Elevation)

- Cards: `var(--elevation-2)`
- Dropdowns: `var(--elevation-3)`
- Modals: `var(--elevation-4)`

---

## 3) Responsive Breakpoints

### 3.1 Mobile (375px)

**Характеристики:**
- Single column layout
- Bottom navigation
- Full-width cards
- Stacked sections

**Padding:**
- Page: 16px
- Cards: 16px

### 3.2 Desktop (1440px)

**Характеристики:**
- Multi-column layouts
- Top navigation + Sidebar
- Max-width containers (1280px)
- Grid layouts (2-3 columns)

**Padding:**
- Page: 32px
- Cards: 24px

### 3.3 Переходы

- Breakpoint: 768px (tablet)
- Mobile-first подход
- Все компоненты адаптивны

---

## 4) Компоненты — визуальные спецификации

### 4.1 Buttons

**Primary Button:**
- Background: `var(--primary)`
- Text: `var(--primary-foreground)`
- Padding: 16px 24px
- Border radius: 12px
- Font: 16px / 500
- Height: 44px (mobile), 40px (desktop)
- Hover: background 90% opacity
- Focus: 2px outline, offset 2px

**Secondary Button:**
- Background: `var(--secondary)`
- Text: `var(--secondary-foreground)`
- Остальное аналогично Primary

**Outline Button:**
- Background: transparent
- Border: 1px solid `var(--border)`
- Text: `var(--foreground)`

### 4.2 Cards

**Standard Card:**
- Background: `var(--card)`
- Padding: 24px
- Border radius: 16px
- Shadow: `var(--elevation-2)`
- Border: 1px solid `var(--border)` (опционально)

**Interactive Card:**
- Hover: shadow `var(--elevation-3)`
- Cursor: pointer
- Transition: 200ms ease

### 4.3 Inputs

**Text Input:**
- Height: 44px (mobile), 40px (desktop)
- Padding: 12px 16px
- Border: 1px solid `var(--border)`
- Border radius: 12px
- Font: 16px / 400
- Focus: border `var(--primary)`, ring 2px

**Error State:**
- Border: `var(--danger)`
- Text: `var(--danger)`
- Icon: AlertCircle (16px)

### 4.4 Typography

**Headings:**
- Color: `var(--foreground)`
- Weight: 600-700
- Line height: 1.2
- Margin bottom: 16px-24px

**Body Text:**
- Color: `var(--foreground)`
- Weight: 400
- Line height: 1.5-1.75
- Margin bottom: 12px-16px

**Muted Text:**
- Color: `var(--muted-foreground)`
- Size: 14px

---

## 5) Экраны — визуальные спецификации

### 5.1 Главная страница (`/`)

**Mobile (375px):**
- Hero section: full-width, padding 24px
- Quick Stats: 2 columns grid
- Topic Cards: 1 column, spacing 16px
- Bottom Navigation: fixed bottom

**Desktop (1440px):**
- Hero section: max-width 1280px, centered
- Quick Stats: 4 columns grid
- Topic Cards: 3 columns grid
- Top Navigation: fixed top

**Цвета:**
- Hero background: gradient (primary → accent)
- Cards: `var(--card)`
- Text: `var(--foreground)`

### 5.2 Квизы (`/quiz/[id]`)

**Progress State:**
- Progress bar: top, height 4px
- Question card: padding 24px, margin 16px
- Navigation: bottom, fixed

**Result State:**
- Icon: 64px, success color
- Score: 48px, bold
- Recommendations: card list
- CTA buttons: full-width (mobile), inline (desktop)

**Crisis State:**
- Background: `var(--danger)` light variant
- Icon: AlertTriangle, 48px
- Text: bold, danger color
- Emergency contacts: prominent card

### 5.3 Booking (`/booking`)

**Service Selection:**
- Service cards: grid, 1 column (mobile), 2 columns (desktop)
- Card height: auto, min-height 200px
- CTA: full-width button

**Slot Selection:**
- Calendar: full-width
- Available slots: grid, 3 columns
- Selected slot: border `var(--primary)`, 2px

**Payment:**
- Form: max-width 600px, centered
- Inputs: full-width
- Submit button: full-width (mobile), auto (desktop)

### 5.4 Личный кабинет (`/cabinet`)

**Mobile:**
- Profile header: full-width, padding 24px
- Stats grid: 2 columns
- Sections: stacked, spacing 16px

**Desktop:**
- Sidebar: 240px width, fixed left
- Main content: margin-left 240px
- Stats grid: 4 columns

---

## 6) Состояния компонентов

### 6.1 Loading States

**Skeleton Loaders:**
- Background: `var(--muted)`
- Border radius: 8px
- Animation: pulse, 1.5s

**Spinner:**
- Size: 24px
- Color: `var(--primary)`
- Animation: rotate, 1s linear infinite

### 6.2 Empty States

**Layout:**
- Icon: 64px, `var(--muted-foreground)`
- Title: 20px, bold
- Description: 16px, muted
- CTA button: primary

**Spacing:**
- Icon margin bottom: 16px
- Title margin bottom: 8px
- Description margin bottom: 24px

### 6.3 Error States

**Inline Error:**
- Border: `var(--danger)`
- Icon: AlertCircle, 16px
- Text: `var(--danger)`, 14px
- Spacing: 8px top

**Error Page (404, 500):**
- Icon: 96px, muted
- Title: 36px, bold
- Description: 18px
- CTA: primary button

### 6.4 Success States

**Toast Notification:**
- Background: `var(--success)`
- Text: `var(--success-foreground)`
- Icon: CheckCircle, 20px
- Position: top-right (desktop), bottom (mobile)

---

## 7) Анимации и переходы

### 7.1 Transitions

**Standard:**
- Duration: 200ms
- Easing: ease
- Properties: all

**Hover:**
- Duration: 150ms
- Easing: ease-in-out

**Page Transitions:**
- Duration: 300ms
- Easing: ease-in-out

### 7.2 Animations

**Pulse (Loading):**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Spin (Spinner):**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 8) Dark Mode

### 8.1 Цвета

Все цвета имеют light и dark варианты через CSS Custom Properties:

```css
:root {
  --background: #F8FAFB; /* light */
}

[data-theme="dark"] {
  --background: #0F1419; /* dark */
}
```

### 8.2 Переключение

- Toggle в навигации
- Сохраняется в localStorage
- Применяется через `next-themes`

---

## 9) Accessibility Specs

### 9.1 Focus States

**Все интерактивные элементы:**
- Outline: 2px solid `var(--focus)`
- Offset: 2px
- Border radius: inherit

**Цвет фокуса:**
- Контраст: минимум 3:1
- Цвет: `var(--focus)` (#17A2B8)

### 9.2 Touch Targets

**Mobile:**
- Минимум: 44×44px
- Рекомендуется: 48×48px
- Spacing между: минимум 8px

**Desktop:**
- Минимум: 24×24px
- Рекомендуется: 32×32px

### 9.3 Color Contrast

Все комбинации проверены:
- Text: минимум 4.5:1 ✅
- UI elements: минимум 3:1 ✅
- Large text: минимум 3:1 ✅

---

## 10) Ссылки на реализацию

### 10.1 Компоненты

- **UI Components:** `design_system/src/app/components/ui/`
- **Domain Components:** `design_system/src/app/components/domain/`
- **App Components:** `design_system/src/app/components/AppComponents.tsx`

### 10.2 Экраны

- **Все экраны:** `design_system/src/app/components/ScreensWeb.tsx`
- **Структура экранов:** `design_system/SCREENS_STRUCTURE.md`
- **Описание экранов:** `design_system/docs/SCREENS_TEMPLATES_GUIDE.md`

### 10.3 Стили

- **Токены:** `design_system/src/styles/theme.css`
- **Tailwind:** `design_system/src/styles/tailwind.css`
- **Fonts:** `design_system/src/styles/fonts.css`

---

## 11) Чеклист визуальной реализации

### При реализации экрана

- [ ] Использованы правильные токены цветов
- [ ] Применены правильные spacing токены
- [ ] Typography соответствует спецификации
- [ ] Border radius соответствует компоненту
- [ ] Shadows применены правильно
- [ ] Responsive поведение реализовано
- [ ] Focus states видны
- [ ] Touch targets соответствуют требованиям
- [ ] Контраст цветов проверен
- [ ] Анимации плавные (200-300ms)

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ **Готово**

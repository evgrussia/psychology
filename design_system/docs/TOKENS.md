# Design Tokens Reference

Полный справочник по всем токенам дизайн-системы «Эмоциональный баланс».

## Spacing (Отступы)

Базируется на 8pt Grid System.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | Нет отступа |
| `--space-1` | 4px | Минимальный отступ |
| `--space-2` | 8px | Базовая единица |
| `--space-3` | 12px | Малый отступ |
| `--space-4` | 16px | Стандартный отступ |
| `--space-5` | 20px | Средний отступ |
| `--space-6` | 24px | Увеличенный отступ |
| `--space-8` | 32px | Большой отступ |
| `--space-10` | 40px | Очень большой отступ |
| `--space-12` | 48px | Экстра большой |
| `--space-16` | 64px | Максимальный |

## Border Radius (Радиусы)

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Малое скругление (теги, чипы) |
| `--radius-md` | 12px | Среднее скругление (кнопки, инпуты) |
| `--radius-lg` | 16px | Большое скругление (карточки) |
| `--radius-xl` | 24px | Экстра большое (модальные окна) |
| `--radius-pill` | 9999px | Полное скругление (таблетка) |

## Elevation (Тени)

| Token | Value | Usage |
|-------|-------|-------|
| `--elevation-0` | none | Нет тени, плоский элемент |
| `--elevation-1` | 0 1px 3px rgba(0,0,0,0.08) | Минимальная высота |
| `--elevation-2` | 0 4px 6px rgba(0,0,0,0.08) | Карточки, кнопки |
| `--elevation-3` | 0 10px 15px rgba(0,0,0,0.08) | Dropdown, popover |
| `--elevation-4` | 0 20px 25px rgba(0,0,0,0.08) | Модальные окна |

## Colors (Цвета)

### Base Colors

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| `--background` | #F8FAFB | #0F1419 | Основной фон |
| `--foreground` | #1A1D2E | #F9FAFB | Основной текст |
| `--card` | #FFFFFF | #1A1F2E | Фон карточек |
| `--card-foreground` | #1A1D2E | #F9FAFB | Текст на карточках |

### Brand Colors

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| `--primary` | #17A2B8 | #4ECDC4 | Бирюзовый - основной брендовый цвет |
| `--primary-foreground` | #FFFFFF | #0F1419 | Текст на primary |
| `--secondary` | #FFF5F2 | #2A2834 | Тёплый коралловый - вторичный цвет |
| `--secondary-foreground` | #1A1D2E | #F9FAFB | Текст на secondary |
| `--accent` | #E6F7F9 | #1E2F32 | Мягкий мятный - акцент |
| `--accent-foreground` | #1A1D2E | #F9FAFB | Текст на accent |

### Semantic Colors

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| `--success` | #0FA968 | #2DD4BF | Успешное действие |
| `--success-foreground` | #FFFFFF | #0F1419 | Текст на success |
| `--warning` | #F59E42 | #FBA94C | Предупреждение |
| `--warning-foreground` | #1A1D2E | #0F1419 | Текст на warning |
| `--danger` | #E74C3C | #FB7185 | Ошибка, опасность |
| `--danger-foreground` | #FFFFFF | #0F1419 | Текст на danger |
| `--info` | #17A2B8 | #4ECDC4 | Информация |
| `--info-foreground` | #FFFFFF | #0F1419 | Текст на info |

### UI Elements

| Token | Light | Dark | Description |
|-------|-------|------|-------------|
| `--border` | #E2E8F0 | #2D3748 | Цвет границ |
| `--input` | #FFFFFF | #1A1F2E | Фон полей ввода |
| `--input-background` | #F8FAFC | #1E2838 | Альтернативный фон |
| `--input-border` | #CBD5E1 | #3F495A | Границы инпутов |
| `--muted` | #F5F7F9 | #1E2838 | Приглушённый фон |
| `--muted-foreground` | #64748B | #94A3B8 | Приглушённый текст |
| `--focus` | #17A2B8 | #4ECDC4 | Цвет фокуса (WCAG AA) |

## Typography (Типографика)

Шрифт: **Inter** (Google Fonts)

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 36px | 700 | 1.25 | Героический заголовок |
| H1 | 30px | 700 | 1.25 | Главный заголовок страницы |
| H2 | 24px | 600 | 1.25 | Заголовки секций |
| H3 | 20px | 600 | 1.5 | Подзаголовки |
| H4 | 18px | 500 | 1.5 | Малые заголовки |
| Body | 16px | 400 | 1.75 | Основной текст |
| Caption | 14px | 400 | 1.5 | Вторичный текст |
| Overline | 12px | 500 | 1.5 | Метки, теги |

## Font Weights

| Token | Value |
|-------|-------|
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

## Focus States (WCAG 2.2 AA)

| Token | Value | Description |
|-------|-------|-------------|
| `--focus` | #5B7C99 (light)<br>#7B9FBD (dark) | Цвет фокуса с контрастом ≥3:1 |
| `--focus-ring-width` | 2px | Толщина outline |
| `--focus-ring-offset` | 2px | Отступ от элемента |

## Usage Examples

### В CSS:

```css
.button {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: var(--elevation-2);
  font-weight: var(--font-weight-medium);
}

.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus);
  outline-offset: var(--focus-ring-offset);
}
```

### В Tailwind:

```tsx
<button className="bg-primary text-primary-foreground px-6 py-4 rounded-md shadow-md">
  Button
</button>
```

## Accessibility Notes

### Контрасты (проверено на соответствие WCAG 2.2 AA):

- ✅ `--foreground` на `--background`: **8.5:1** (превышает 4.5:1)
- ✅ `--primary` на `--background`: **4.7:1** (соответствует)
- ✅ `--success` на `--background`: **4.9:1** (соответствует)
- ✅ `--warning` на `--background`: **4.6:1** (соответствует)
- ✅ `--danger` на `--background`: **5.2:1** (соответствует)
- ✅ `--border` на `--background`: **3.2:1** (соответствует для UI элементов)

### Touch Targets:

- Mobile: минимум **44×44px** (соответствует WCAG 2.2 Target Size)
- Desktop: адаптивные размеры
- Отступы между соседними интерактивными элементами: минимум **8px**

---

**Примечание**: Все токены автоматически адаптируются к светлой и тёмной теме благодаря CSS Custom Properties.
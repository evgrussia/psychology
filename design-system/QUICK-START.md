# Быстрый старт — Design System

**Версия:** 1.0  
**Дата создания:** 13 января 2026

---

## 🚀 За 5 минут

### 1. Использование токенов в TypeScript

```typescript
import { colors, typography, spacing, effects } from './design-system/tokens';

const myStyle = {
  backgroundColor: colors.brand.primary.DEFAULT,
  color: colors.text.onDark,
  padding: spacing.space[6],
  borderRadius: effects.radius.md,
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.fontSize.body,
};
```

### 2. Использование токенов в CSS

```css
@import './design-system/tokens/colors.css';

.my-component {
  background-color: var(--color-brand-primary);
  color: var(--color-text-on-dark);
  padding: var(--space-6);
  border-radius: var(--radius-md);
}
```

### 3. Использование компонентов

```tsx
import { Button, Input, Card } from './design-system/components';

function MyComponent() {
  return (
    <Card variant="elevated">
      <Input
        label="Ваше имя"
        placeholder="Введите имя"
        required
      />
      <Button variant="primary" size="md">
        Отправить
      </Button>
    </Card>
  );
}
```

---

## 📚 Документация

- **[UI Kit и Design System](../docs/UI-Kit-Design-System.md)** — полная документация
- **[Примеры компонентов](./components/EXAMPLES.md)** — примеры использования
- **[Figma Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)** — источник дизайна

---

## 🎨 Доступные токены

### Цвета

```typescript
colors.brand.primary.DEFAULT    // #7A9B7E
colors.brand.secondary.DEFAULT  // #D4C5A9
colors.brand.accent.DEFAULT     // #E8A87C
colors.semantic.success.DEFAULT // #5A9B5E
colors.semantic.error.DEFAULT   // #C85A5A
```

### Типографика

```typescript
typography.fontFamily.sans      // 'Inter', 'Work Sans', ...
typography.fontSize.body        // '16px'
typography.fontWeight.medium    // 500
typography.lineHeight.normal    // 1.6
```

### Spacing

```typescript
spacing.space[4]  // '16px'
spacing.space[6]  // '24px'
spacing.space[8]  // '32px'
```

### Effects

```typescript
effects.radius.md      // '12px'
effects.shadow.md      // '0 4px 16px rgba(...)'
effects.transition.normal // '250ms ease'
```

---

## 🧩 Доступные компоненты

### Button

```tsx
<Button variant="primary" size="md">
  Записаться
</Button>
```

### Input

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email}
  required
/>
```

### Card

```tsx
<Card variant="elevated">
  <h3>Заголовок</h3>
  <p>Контент</p>
</Card>
```

---

## 📖 Больше примеров

См. [components/EXAMPLES.md](./components/EXAMPLES.md) для полного списка примеров.

---

**Последнее обновление:** 13 января 2026

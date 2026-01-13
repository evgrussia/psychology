# Design System — «Эмоциональный баланс»

**Версия:** 1.0  
**Дата создания:** 13 января 2026  
**Источник:** [Figma Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)

---

## 📁 Структура

```
design-system/
├── README.md                    # Этот файл
├── tokens/                      # Design Tokens
│   ├── colors.ts               # Цветовая палитра (TypeScript)
│   ├── colors.css              # Цветовая палитра (CSS)
│   ├── typography.ts           # Типографика (TypeScript)
│   ├── spacing.ts              # Отступы и размеры (TypeScript)
│   ├── effects.ts              # Тени, границы, эффекты (TypeScript)
│   └── index.ts                # Централизованный экспорт
├── components/                  # UI Компоненты (будут добавлены)
│   └── README.md
├── ui-kit/                      # UI Kit документация
│   └── README.md
└── assets/                      # Графические ресурсы из Figma
    └── README.md
```

---

## 🚀 Быстрый старт

### Использование в TypeScript/JavaScript

```typescript
import { colors, typography, spacing, effects } from './design-system/tokens';

// Использование токенов
const primaryColor = colors.brand.primary.DEFAULT;
const heroFontSize = typography.fontSize.hero;
const containerPadding = spacing.container.padding;
const shadow = effects.shadow.md;
```

### Использование в CSS

```css
@import './design-system/tokens/colors.css';

.my-component {
  background-color: var(--color-brand-primary);
  color: var(--color-text-on-dark);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### Использование CSS Custom Properties

```typescript
import { allTokensCSS } from './design-system/tokens';

// Применить все токены к элементу
Object.assign(document.documentElement.style, allTokensCSS);
```

---

## 📚 Документация

### Основная документация

- **[UI Kit и Design System](../docs/UI-Kit-Design-System.md)** — полная документация дизайн-системы
- **[Content Guide](../docs/Content-Guide-UX-Copywriting.md)** — микрокопи и тон голоса
- **[Accessibility Requirements](../docs/Accessibility-A11y-Requirements.md)** — требования доступности

### Референсы

- **[Q Psychology Design Specification](../docs/generated/frontend/QPsychology-Complete-Design-Specification.md)** — референс дизайна
- **[Component Library](../docs/research/11-Component-Library-and-Copy.md)** — каталог компонентов

---

## 🎨 Figma

### Ссылка на Design System

🔗 **[Emotional Balance Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)**

### Структура в Figma

1. **Design Tokens** — все токены (цвета, типографика, spacing, эффекты)
2. **UI Components** — готовые компоненты для использования
3. **Patterns & Compositions** — паттерны и композиции
4. **Documentation** — гайдлайны и примеры использования

### Обновление из Figma

1. Откройте [Figma Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)
2. Экспортируйте токены через Figma Tokens или вручную
3. Обновите файлы в `design-system/tokens/`
4. Обновите компоненты в `design-system/components/` (если есть изменения)
5. Обновите документацию в `docs/UI-Kit-Design-System.md`

---

## 🛠️ Разработка

### Добавление новых токенов

1. Добавьте токен в соответствующий файл в `tokens/`
2. Экспортируйте через `tokens/index.ts`
3. Добавьте CSS Custom Property (если нужно)
4. Обновите документацию в `docs/UI-Kit-Design-System.md`
5. Обновите Figma файл

### Создание компонентов

1. Создайте компонент в `components/`
2. Используйте токены из `tokens/`
3. Следуйте принципам доступности из [Accessibility Requirements](../docs/Accessibility-A11y-Requirements.md)
4. Добавьте документацию в `components/README.md`
5. Добавьте примеры в `components/EXAMPLES.md`
6. Обновите `components/index.ts`
7. Обновите Figma файл

### Реализованные компоненты

- ✅ **Button** — кнопка с вариантами (primary, secondary, tertiary, ghost)
- ✅ **Input** — поле ввода с валидацией
- ✅ **Card** — карточка контента

См. [Примеры использования](./components/EXAMPLES.md) для деталей.

---

## 📝 Принципы

### Философия дизайна

- **Эмпатия и безопасность**: тёплая палитра, мягкие формы
- **Прозрачность**: понятные состояния, ясная навигация
- **Без давления**: мягкие переходы, возможность отмены
- **Доступность**: WCAG 2.1 AA
- **Консистентность**: единые паттерны

### Цветовая концепция

- **Sage Green** (#7A9B7E) — основной бренд-цвет
- **Warm Sand** (#D4C5A9) — вторичный цвет
- **Coral** (#E8A87C) — акцентный цвет

---

**Последнее обновление:** 13 января 2026  
**Версия:** 1.0

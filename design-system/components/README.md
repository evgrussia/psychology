# UI Components

**Версия:** 1.0  
**Дата создания:** 13 января 2026

---

## 📋 Описание

Эта папка содержит реализацию UI компонентов проекта «Эмоциональный баланс».

Компоненты основаны на:
- [UI Kit и Design System](../docs/UI-Kit-Design-System.md)
- [Figma Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)
- [Accessibility Requirements](../docs/Accessibility-A11y-Requirements.md)

---

## 🚧 Статус

### ✅ Реализованные компоненты

- **Button** — кнопка с вариантами (primary, secondary, tertiary, ghost)
- **Input** — поле ввода с поддержкой ошибок и подсказок
- **Card** — карточка контента с вариантами стилей

### 📚 Документация

- [Примеры использования](./EXAMPLES.md) — примеры кода для всех компонентов
- [UI Kit и Design System](../docs/UI-Kit-Design-System.md) — полная документация
- [Q Psychology Design Specification](../docs/generated/frontend/QPsychology-Complete-Design-Specification.md) — референс

---

## 📚 Структура компонентов

### Buttons
- Primary Button
- Secondary Button
- Tertiary Button
- Ghost Button

### Form Elements
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch

### Cards
- Topic Card
- Problem Card
- Result Card
- Info Card

### Navigation
- Header
- Footer
- Breadcrumbs

### Feedback
- Toast
- Alert
- Modal
- Tooltip

### Progress Indicators
- Progress Bar
- Spinner
- Skeleton

---

## 🛠️ Принципы разработки

1. **Используйте токены** из `design-system/tokens/`
2. **Следуйте принципам доступности** из [Accessibility Requirements](../docs/Accessibility-A11y-Requirements.md)
3. **Используйте TypeScript** для типизации
4. **Документируйте компоненты** с примерами использования
5. **Тестируйте компоненты** согласно [Testing Rules](../.cursor/rules/testing-rules.mdc)

---

**Последнее обновление:** 13 января 2026

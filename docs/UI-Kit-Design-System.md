# UI Kit и Design System — «Эмоциональный баланс»

**Версия:** v1.0  
**Дата создания:** 13 января 2026  
**Источник дизайна:** [Figma Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)  
**Статус:** ✅ Готово к реализации

---

## 📋 Содержание

1. [Обзор и принципы](#обзор-и-принципы)
2. [Ссылки на Figma](#ссылки-на-figma)
3. [Design Tokens](#design-tokens)
4. [Типографическая система](#типографическая-система)
5. [Компоненты UI Kit](#компоненты-ui-kit)
6. [Паттерны и композиции](#паттерны-и-композиции)
7. [Адаптивность](#адаптивность)
8. [Accessibility (a11y)](#accessibility-a11y)
9. [Использование в проекте](#использование-в-проекте)

---

## Обзор и принципы

### Философия дизайна

Design System проекта «Эмоциональный баланс» построен на принципах:

- **Эмпатия и безопасность**: тёплая палитра, мягкие формы, комфортные интервалы
- **Прозрачность**: понятные состояния, ясная навигация, честные CTA
- **Без давления**: мягкие переходы, возможность отмены, бережные формулировки
- **Доступность**: соответствие WCAG 2.1 AA, поддержка клавиатурной навигации
- **Консистентность**: единые паттерны для всех модулей проекта

### Цветовая концепция

Палитра основана на тёплых, природных тонах:
- **Sage Green** (шалфейный зелёный) — основной бренд-цвет, ассоциируется с покоем и балансом
- **Warm Sand** (тёплый песок) — фоновые цвета, создают мягкий контраст
- **Coral** (коралловый) — акцентный цвет для важных действий и состояний

### Тон голоса (Tone of Voice)

Все тексты в UI следуют принципам из [Content Guide](./Content-Guide-UX-Copywriting.md):
- Эмпатично, без обесценивания
- Без давления и директивности
- Прозрачно и честно
- С уважением к автономии пользователя

---

## Ссылки на Figma

### Основной файл Design System

🔗 **[Emotional Balance Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)**

### Структура в Figma

В Figma файле организованы следующие разделы:

1. **Design Tokens**
   - Цвета (Colors)
   - Типографика (Typography)
   - Spacing & Layout
   - Border Radius
   - Shadows & Effects
   - Breakpoints

2. **UI Components**
   - Buttons (Primary, Secondary, Tertiary, Ghost)
   - Form Elements (Input, Textarea, Select, Checkbox, Radio)
   - Cards (Topic Card, Problem Card, Result Card)
   - Navigation (Header, Footer, Breadcrumbs)
   - Feedback (Toast, Alert, Modal)
   - Progress Indicators

3. **Patterns & Compositions**
   - Hero Sections
   - Trust Blocks
   - CTA Blocks
   - How It Works
   - FAQ Sections
   - Test/Quiz Interfaces

4. **Documentation**
   - Usage Guidelines
   - Component States
   - Accessibility Notes
   - Animation Principles

### Как использовать Figma

1. **Для дизайнеров**: используйте компоненты из Figma как основу для новых экранов
2. **Для разработчиков**: экспортируйте токены через Figma Tokens или используйте CSS из секции "Code"
3. **Для контент-менеджеров**: используйте текстовые стили и микрокопи из Figma

---

## Design Tokens

Все дизайн-токены определены в файлах:
- [`design-system/tokens/colors.ts`](../design-system/tokens/colors.ts) — цветовая палитра
- [`design-system/tokens/typography.ts`](../design-system/tokens/typography.ts) — типографика
- [`design-system/tokens/spacing.ts`](../design-system/tokens/spacing.ts) — отступы и размеры
- [`design-system/tokens/effects.ts`](../design-system/tokens/effects.ts) — тени, границы, эффекты

### Цвета

#### Brand Colors

```css
/* Primary Brand */
--color-brand-primary: #7A9B7E;           /* Sage Green — основной бренд-цвет */
--color-brand-primary-dark: #5A7A5E;     /* Тёмный вариант для hover */
--color-brand-primary-light: #9AB89E;     /* Светлый вариант для фонов */

/* Secondary Brand */
--color-brand-secondary: #D4C5A9;        /* Warm Sand — вторичный цвет */
--color-brand-secondary-dark: #B8A68A;    /* Тёмный вариант */
--color-brand-secondary-light: #E8DBC5;  /* Светлый вариант */

/* Accent */
--color-brand-accent: #E8A87C;            /* Coral — акцентный цвет */
--color-brand-accent-dark: #D18A5F;       /* Тёмный вариант */
--color-brand-accent-light: #F5C4A0;      /* Светлый вариант */
```

#### Semantic Colors

```css
/* Success */
--color-success: #5A9B5E;
--color-success-light: #E8F5E9;
--color-success-dark: #3A7A3E;

/* Warning */
--color-warning: #E8A87C;
--color-warning-light: #FFF4E8;
--color-warning-dark: #D18A5F;

/* Error */
--color-error: #C85A5A;
--color-error-light: #FFEBEE;
--color-error-dark: #A83A3A;

/* Info */
--color-info: #5A8A9B;
--color-info-light: #E8F4F8;
--color-info-dark: #3A6A7A;
```

#### Background Colors

```css
--color-bg-primary: #FAF8F4;              /* Основной фон (warm off-white) */
--color-bg-secondary: #F5F2ED;            /* Вторичный фон */
--color-bg-tertiary: #EFEBE5;             /* Третичный фон */
--color-bg-dark: #5A7A5E;                 /* Тёмный фон */
--color-bg-overlay: rgba(90, 122, 94, 0.85); /* Оверлей для модальных окон */
```

#### Text Colors

```css
--color-text-primary: #2A3A2E;            /* Основной текст */
--color-text-secondary: #5A6A5E;         /* Вторичный текст */
--color-text-tertiary: #8A9A8E;          /* Третичный текст */
--color-text-on-dark: #FAF8F4;           /* Текст на тёмном фоне */
--color-text-muted: #AABAAE;             /* Приглушённый текст */
--color-text-disabled: #CACACA;          /* Деактивированный текст */
```

#### Border Colors

```css
--color-border-primary: #E5E0D8;          /* Основные границы */
--color-border-secondary: #D8D0C5;       /* Вторичные границы */
--color-border-focus: #7A9B7E;           /* Фокус (акцент) */
--color-border-error: #C85A5A;           /* Ошибка */
```

### Типографика

#### Font Families

```css
/* Serif — для заголовков Hero и эмоциональных блоков */
--font-serif: 'Lora', 'Georgia', 'Times New Roman', serif;

/* Sans-serif — основной текст и UI */
--font-sans: 'Inter', 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;

/* Monospace — для кода (если нужен) */
--font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
```

#### Font Sizes

```css
/* Desktop */
--font-size-hero: clamp(48px, 6vw, 72px);      /* Hero заголовки */
--font-size-h1: clamp(36px, 4.5vw, 48px);      /* H1 */
--font-size-h2: clamp(28px, 3.5vw, 36px);       /* H2 */
--font-size-h3: clamp(24px, 3vw, 28px);         /* H3 */
--font-size-h4: clamp(20px, 2.5vw, 24px);       /* H4 */
--font-size-body-lg: 18px;                      /* Крупный body */
--font-size-body: 16px;                         /* Основной body */
--font-size-body-sm: 14px;                      /* Мелкий текст */
--font-size-caption: 12px;                      /* Caption/метки */

/* Mobile */
@media (max-width: 768px) {
  --font-size-hero: 40px;
  --font-size-h1: 32px;
  --font-size-h2: 28px;
  --font-size-body-lg: 16px;
}
```

#### Font Weights

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

#### Line Heights

```css
--line-height-tight: 1.2;                 /* Заголовки */
--line-height-snug: 1.4;                  /* Подзаголовки */
--line-height-normal: 1.6;                /* Body текст */
--line-height-relaxed: 1.8;               /* Комфортное чтение */
```

### Spacing

```css
/* Base scale (8px grid) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;

/* Layout */
--container-max-width: 1280px;
--container-padding: var(--space-6);
--section-spacing: var(--space-20);
--element-spacing: var(--space-8);
```

### Border Radius

```css
--radius-sm: 6px;                         /* Мелкие элементы */
--radius-md: 12px;                        /* Карточки, поля ввода */
--radius-lg: 20px;                        /* Крупные контейнеры */
--radius-xl: 32px;                        /* Кнопки-пилюли */
--radius-pill: 9999px;                    /* Полное скругление */
--radius-circle: 50%;                     /* Круглые элементы */
```

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(42, 58, 46, 0.08);
--shadow-md: 0 4px 16px rgba(42, 58, 46, 0.12);
--shadow-lg: 0 8px 24px rgba(42, 58, 46, 0.16);
--shadow-xl: 0 12px 32px rgba(42, 58, 46, 0.20);
--shadow-inner: inset 0 2px 4px rgba(42, 58, 46, 0.06);
```

---

## Типографическая система

### Заголовки

#### Hero (H1)

Используется для главных заголовков на Hero-секциях.

```css
.typography-hero {
  font-family: var(--font-serif);
  font-size: var(--font-size-hero);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}
```

#### H1

Основной заголовок страницы.

```css
.typography-h1 {
  font-family: var(--font-serif);
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-snug);
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}
```

#### H2

Заголовок секции.

```css
.typography-h2 {
  font-family: var(--font-sans);
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  color: var(--color-text-primary);
}
```

#### H3, H4

Подзаголовки.

```css
.typography-h3 {
  font-family: var(--font-sans);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  color: var(--color-text-primary);
}

.typography-h4 {
  font-family: var(--font-sans);
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}
```

### Body Text

```css
.typography-body-lg {
  font-family: var(--font-sans);
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.typography-body {
  font-family: var(--font-sans);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
}

.typography-body-sm {
  font-family: var(--font-sans);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
}

.typography-caption {
  font-family: var(--font-sans);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Компоненты UI Kit

Все компоненты определены в [`design-system/components/`](../design-system/components/) и документированы в Figma.

### Buttons

#### Primary Button

Основная кнопка для главных действий (запись, отправка формы).

```tsx
<Button variant="primary" size="md">
  Записаться на консультацию
</Button>
```

#### Secondary Button

Вторичная кнопка для альтернативных действий.

```tsx
<Button variant="secondary" size="md">
  Получить план в Telegram
</Button>
```

#### Tertiary Button

Третичная кнопка для менее важных действий.

```tsx
<Button variant="tertiary" size="md">
  Узнать больше
</Button>
```

#### Ghost Button

Прозрачная кнопка для второстепенных действий.

```tsx
<Button variant="ghost" size="md">
  Отмена
</Button>
```

### Form Elements

#### Input

```tsx
<Input
  label="Ваше имя"
  placeholder="Введите имя"
  error={errors.name}
  required
/>
```

#### Textarea

```tsx
<Textarea
  label="Ваш вопрос"
  placeholder="Опишите ситуацию..."
  rows={4}
/>
```

#### Select

```tsx
<Select
  label="Формат консультации"
  options={formats}
  value={selectedFormat}
  onChange={handleChange}
/>
```

#### Checkbox

```tsx
<Checkbox
  label="Я согласен с политикой конфиденциальности"
  checked={agreed}
  onChange={handleChange}
/>
```

#### Radio

```tsx
<RadioGroup
  label="Выберите тему"
  options={topics}
  value={selectedTopic}
  onChange={handleChange}
/>
```

### Cards

#### Topic Card

Карточка темы/проблемы.

```tsx
<TopicCard
  title="Тревога"
  description="Короткое описание"
  icon={<AnxietyIcon />}
  href="/topics/anxiety"
/>
```

#### Problem Card

Карточка проблемы с CTA.

```tsx
<ProblemCard
  title="Выгорание"
  description="Описание проблемы"
  timeToBenefit="2-3 недели"
  ctaText="Начать"
  href="/start/burnout"
/>
```

#### Result Card

Карточка результата теста/квиза.

```tsx
<ResultCard
  level="Умеренная тревога"
  description="Описание результата"
  steps={steps}
  ctaText="Получить план"
/>
```

### Navigation

#### Header

Липкий хедер с навигацией.

```tsx
<Header
  logo={<Logo />}
  navItems={navItems}
  ctaButton={<Button variant="primary">Записаться</Button>}
/>
```

#### Footer

Футер с навигацией и контактами.

```tsx
<Footer
  links={footerLinks}
  emergencyLink="/emergency"
  contacts={contacts}
/>
```

### Feedback

#### Toast

Всплывающее уведомление.

```tsx
<Toast
  type="success"
  message="Запись успешно создана"
  duration={3000}
/>
```

#### Alert

Алерт для важных сообщений.

```tsx
<Alert
  type="info"
  title="Важная информация"
  message="Текст сообщения"
/>
```

#### Modal

Модальное окно.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Подтверждение"
>
  <ModalContent>...</ModalContent>
</Modal>
```

### Progress Indicators

#### Progress Bar

```tsx
<ProgressBar
  current={5}
  total={10}
  label="Вопрос 5 из 10"
/>
```

#### Spinner

```tsx
<Spinner size="md" />
```

---

## Паттерны и композиции

### Hero Section

Главная секция страницы с заголовком и CTA.

```tsx
<HeroSection
  title="Эмоциональный баланс"
  subtitle="Тёплое пространство поддержки"
  description="Описание"
  primaryCTA={<Button variant="primary">Начать</Button>}
  secondaryCTA={<Button variant="secondary">Узнать больше</Button>}
  backgroundImage="/images/hero.jpg"
/>
```

### Trust Blocks

Блоки доверия (конфиденциальность, подход, границы).

```tsx
<TrustBlocks
  items={[
    { icon: <LockIcon />, title: "Конфиденциально", description: "..." },
    { icon: <HeartIcon />, title: "Бережно", description: "..." },
    { icon: <ShieldIcon />, title: "Прозрачно", description: "..." }
  ]}
/>
```

### CTA Block

Универсальный блок с призывом к действию.

```tsx
<CTABlock
  title="Готовы начать?"
  description="Выберите удобный формат"
  primaryCTA={<Button variant="primary">Записаться</Button>}
  secondaryCTA={<Button variant="secondary">Telegram</Button>}
/>
```

### How It Works

Блок "Как это работает".

```tsx
<HowItWorks
  steps={[
    { number: 1, title: "Выберите тему", description: "..." },
    { number: 2, title: "Запишитесь", description: "..." },
    { number: 3, title: "Встреча", description: "..." }
  ]}
/>
```

### FAQ Section

Секция часто задаваемых вопросов.

```tsx
<FAQSection
  items={faqItems}
  title="Частые вопросы"
/>
```

---

## Адаптивность

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;    /* Small devices */
--breakpoint-md: 768px;    /* Tablets */
--breakpoint-lg: 1024px;   /* Desktop */
--breakpoint-xl: 1280px;   /* Large desktop */
--breakpoint-2xl: 1536px;  /* Extra large */
```

### Responsive Patterns

- **Mobile (< 768px)**: одноколоночная компоновка, упрощённая навигация
- **Tablet (768px - 1024px)**: двухколоночная компоновка, расширенная навигация
- **Desktop (> 1024px)**: полная компоновка, все элементы видны

---

## Accessibility (a11y)

### Требования

Все компоненты соответствуют [WCAG 2.1 AA](./Accessibility-A11y-Requirements.md):

- ✅ Минимальный контраст текста 4.5:1
- ✅ Поддержка клавиатурной навигации
- ✅ ARIA-атрибуты для интерактивных элементов
- ✅ Фокус-индикаторы для всех интерактивных элементов
- ✅ Альтернативный текст для изображений
- ✅ Семантическая разметка HTML

### Примеры

```tsx
// Правильная кнопка с доступностью
<button
  aria-label="Закрыть модальное окно"
  onClick={handleClose}
  className="btn-close"
>
  <CloseIcon aria-hidden="true" />
</button>

// Правильный input
<label htmlFor="name-input">Ваше имя</label>
<input
  id="name-input"
  type="text"
  aria-required="true"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? "name-error" : undefined}
/>
{errors.name && (
  <span id="name-error" role="alert">
    {errors.name}
  </span>
)}
```

---

## Использование в проекте

### Установка

1. Импортируйте токены в ваш CSS/SCSS:

```css
@import '../design-system/tokens/colors.css';
@import '../design-system/tokens/typography.css';
@import '../design-system/tokens/spacing.css';
```

2. Или используйте TypeScript/JavaScript токены:

```typescript
import { colors, typography, spacing } from '../design-system/tokens';
```

### Использование компонентов

```tsx
import { Button, Input, Card } from '../design-system/components';

function MyPage() {
  return (
    <div>
      <Button variant="primary">Записаться</Button>
      <Input label="Имя" />
      <Card title="Заголовок">Контент</Card>
    </div>
  );
}
```

### Обновление из Figma

1. Откройте [Figma Design System](https://www.figma.com/make/ls1ACoHXpuzTb3hkMuGrsB/Emotional-Balance-Design-System?t=aP31NKbERGrs98Ho-1)
2. Экспортируйте токены через Figma Tokens или вручную
3. Обновите файлы в `design-system/tokens/`
4. Обновите компоненты в `design-system/components/`
5. Обновите документацию

---

## Связанные документы

- [Content Guide](./Content-Guide-UX-Copywriting.md) — микрокопи и тон голоса
- [Accessibility Requirements](./Accessibility-A11y-Requirements.md) — требования доступности
- [Q Psychology Design Specification](./generated/frontend/QPsychology-Complete-Design-Specification.md) — референс
- [Component Library](./research/11-Component-Library-and-Copy.md) — каталог компонентов

---

**Последнее обновление:** 13 января 2026  
**Версия:** 1.0  
**Статус:** ✅ Готово к использованию

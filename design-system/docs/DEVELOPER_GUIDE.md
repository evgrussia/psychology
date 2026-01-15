# Developer Guide

Руководство для разработчиков по использованию дизайн-системы «Эмоциональный баланс».

## Начало работы

### 1. Структура проекта

```
/src/
├── app/
│   ├── App.tsx                     # Главное приложение
│   └── components/
│       ├── domain/                 # Доменные компоненты
│       │   ├── QuizCard.tsx
│       │   ├── MoodCheckIn.tsx
│       │   ├── ContentModuleTile.tsx
│       │   ├── BookingSlot.tsx
│       │   └── ModerationQueueItem.tsx
│       └── ui/                     # Базовые UI компоненты
│           ├── button.tsx
│           ├── input.tsx
│           ├── card.tsx
│           └── ...
└── styles/
    ├── theme.css                   # Токены дизайн-системы
    ├── fonts.css                   # Шрифты
    └── index.css                   # Главный CSS файл
```

### 2. Импорт компонентов

```tsx
// Базовые UI компоненты
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Доменные компоненты
import { QuizCard } from '@/components/domain/QuizCard';
import { MoodCheckIn } from '@/components/domain/MoodCheckIn';
import { ContentModuleTile } from '@/components/domain/ContentModuleTile';
```

## Использование компонентов

### Кнопки

```tsx
import { Button } from '@/components/ui/button';

// Варианты
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Размеры
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Состояния
<Button disabled>Disabled</Button>
<Button>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>
```

### Формы

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="example@email.com"
  />
</div>

// С ошибкой
<Input
  id="email"
  className="border-danger focus:ring-danger"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" className="text-sm text-danger">
  <AlertCircle className="w-4 h-4 inline mr-1" />
  Введите корректный email
</p>
```

### Карточки

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Заголовок карточки</CardTitle>
    <CardDescription>Описание карточки</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Контент карточки</p>
  </CardContent>
</Card>
```

### Quiz Card

```tsx
import { QuizCard } from '@/components/domain/QuizCard';

// Одиночный выбор
<QuizCard variant="single-choice" />

// Множественный выбор
<QuizCard variant="multi-choice" />

// Шкала
<QuizCard variant="scale" />
```

### Mood Check-in

```tsx
import { MoodCheckIn } from '@/components/domain/MoodCheckIn';

<MoodCheckIn />
// Компонент полностью самодостаточный, включает состояния и логику
```

### Content Module Tile

```tsx
import { ContentModuleTile } from '@/components/domain/ContentModuleTile';

<ContentModuleTile
  title="Управление стрессом"
  description="Эффективные техники снижения стресса"
  duration="20 мин"
  progress={45}
  status="in-progress"  // 'locked' | 'available' | 'in-progress' | 'completed'
  category="Стресс-менеджмент"
  imageUrl="https://..."
/>
```

### Booking Slot

```tsx
import { BookingSlot } from '@/components/domain/BookingSlot';

<BookingSlot
  specialist={{
    name: "Анна Петрова",
    title: "Психолог, КПТ-терапевт",
    avatar: "https://..."
  }}
  date="15 января"
  time="14:00"
  duration="50 мин"
  type="online"  // 'online' | 'offline'
  price="3 500 ₽"
  available={true}
  location="ул. Ленина, 12"  // для offline
/>
```

### Moderation Queue Item

```tsx
import { ModerationQueueItem } from '@/components/domain/ModerationQueueItem';

<ModerationQueueItem
  author={{
    name: "Александр К.",
    avatar: "https://..."
  }}
  content="Текст пользовательского контента..."
  type="post"  // 'post' | 'comment' | 'review'
  timestamp="2 часа назад"
  flags={["Спам", "Оскорбления"]}  // массив жалоб
  status="pending"  // 'pending' | 'approved' | 'rejected'
/>
```

## Работа с токенами

### В CSS

```css
.my-component {
  /* Цвета */
  background: var(--primary);
  color: var(--primary-foreground);
  border: 1px solid var(--border);
  
  /* Отступы */
  padding: var(--space-4);
  margin: var(--space-6);
  gap: var(--space-2);
  
  /* Радиусы */
  border-radius: var(--radius-lg);
  
  /* Тени */
  box-shadow: var(--elevation-2);
  
  /* Типографика */
  font-weight: var(--font-weight-medium);
}

/* Фокус */
.my-component:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus);
  outline-offset: var(--focus-ring-offset);
}
```

### В Tailwind

```tsx
<div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-md">
  Контент
</div>
```

### Доступные Tailwind классы

**Цвета:**
- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-success`, `text-success`, `border-success`
- `bg-warning`, `text-warning`, `border-warning`
- `bg-danger`, `text-danger`, `border-danger`
- `bg-muted`, `text-muted-foreground`

**Отступы:**
- `p-0`, `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px)...
- То же для `m-*`, `px-*`, `py-*`, `gap-*`

**Радиусы:**
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

## Темная тема

### Автоматическое переключение

Тёмная тема работает автоматически благодаря `next-themes`:

```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### CSS для разных тем

Все токены автоматически адаптируются. Не нужно писать отдельные стили:

```css
/* ❌ Не нужно */
.light .my-component {
  background: #fff;
}
.dark .my-component {
  background: #000;
}

/* ✅ Правильно */
.my-component {
  background: var(--background);
}
```

## Доступность (A11y)

### Обязательные практики

1. **Семантическая разметка:**
```tsx
// ✅ Правильно
<button onClick={handleClick}>Кликни</button>

// ❌ Неправильно
<div onClick={handleClick}>Кликни</div>
```

2. **Labels для форм:**
```tsx
// ✅ Правильно
<Label htmlFor="name">Имя</Label>
<Input id="name" />

// ❌ Неправильно
<Input placeholder="Имя" />
```

3. **ARIA для иконочных кнопок:**
```tsx
// ✅ Правильно
<button aria-label="Закрыть">
  <X />
</button>

// ❌ Неправильно
<button>
  <X />
</button>
```

4. **Обработка ошибок:**
```tsx
// ✅ Правильно
<Input
  aria-invalid="true"
  aria-describedby="error-msg"
/>
<p id="error-msg" className="text-danger">
  <AlertCircle /> Ошибка валидации
</p>

// ❌ Неправильно
<Input className="border-danger" />
```

### Проверка доступности

```bash
# Используйте расширения браузера
- axe DevTools
- WAVE

# Проверьте с клавиатуры
- Tab / Shift+Tab - навигация
- Enter / Space - активация
- Esc - закрытие модалок

# Проверьте со screen reader
- NVDA (Windows)
- VoiceOver (macOS)
```

## Адаптивность

### Mobile-first подход

```tsx
// Всегда начинайте с mobile
<div className="
  p-4              /* mobile: 16px */
  md:p-6           /* tablet: 24px */
  lg:p-8           /* desktop: 32px */
">
  <h1 className="
    text-2xl       /* mobile */
    md:text-3xl    /* tablet */
    lg:text-4xl    /* desktop */
  ">
    Заголовок
  </h1>
</div>
```

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Лучшие практики

### 1. Консистентность

✅ **Правильно:**
- Используйте существующие компоненты
- Следуйте паттернам дизайн-системы
- Применяйте токены вместо хардкода

❌ **Неправильно:**
- Создавать свои версии существующих компонентов
- Использовать произвольные цвета/отступы
- Игнорировать design tokens

### 2. Производительность

✅ **Правильно:**
```tsx
import { Button } from '@/components/ui/button';  // именованный импорт
```

❌ **Неправильно:**
```tsx
import * as UI from '@/components/ui';  // импорт всего
```

### 3. Типизация

✅ **Правильно:**
```tsx
interface MyComponentProps {
  title: string;
  onSave: () => void;
  isLoading?: boolean;
}

export function MyComponent({ title, onSave, isLoading = false }: MyComponentProps) {
  // ...
}
```

### 4. Обработка состояний

Всегда показывайте loading, error и empty состояния:

```tsx
function DataList({ data, isLoading, error }) {
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!data.length) return <EmptyState />;
  
  return <List data={data} />;
}
```

## Тестирование

### Чек-лист перед коммитом

- [ ] Компонент работает в светлой и тёмной теме
- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Фокус виден на всех элементах
- [ ] Контраст соответствует WCAG AA
- [ ] Touch targets ≥ 44×44px на mobile
- [ ] Есть обработка loading/error/empty состояний
- [ ] Код типизирован (TypeScript)
- [ ] Используются токены дизайн-системы

## Помощь и поддержка

- 📖 **Документация**: `/docs/DESIGN_SYSTEM.md`
- 🎨 **Токены**: `/docs/TOKENS.md`
- ♿ **Доступность**: `/docs/ACCESSIBILITY.md`
- 💬 **Вопросы**: создайте issue в репозитории

---

**Happy coding!** 🚀

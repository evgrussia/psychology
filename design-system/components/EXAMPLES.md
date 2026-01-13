# Примеры использования компонентов

**Версия:** 1.0  
**Дата создания:** 13 января 2026

---

## Button

### Primary Button

```tsx
import { Button } from './design-system/components';

<Button variant="primary" size="md">
  Записаться на консультацию
</Button>
```

### Secondary Button

```tsx
<Button variant="secondary" size="md">
  Получить план в Telegram
</Button>
```

### Button с состояниями

```tsx
<Button variant="primary" loading={isLoading} disabled={isDisabled}>
  Отправить
</Button>

<Button variant="primary" fullWidth>
  Полная ширина
</Button>
```

---

## Input

### Базовый Input

```tsx
import { Input } from './design-system/components';

<Input
  label="Ваше имя"
  placeholder="Введите имя"
  required
/>
```

### Input с ошибкой

```tsx
<Input
  label="Email"
  type="email"
  error="Некорректный email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Input с подсказкой

```tsx
<Input
  label="Телефон"
  type="tel"
  helperText="Мы используем телефон только для связи"
  fullWidth
/>
```

---

## Card

### Базовая карточка

```tsx
import { Card } from './design-system/components';

<Card>
  <h3>Заголовок</h3>
  <p>Содержимое карточки</p>
</Card>
```

### Карточка с тенью

```tsx
<Card variant="elevated">
  <h3>Заголовок</h3>
  <p>Карточка с тенью</p>
</Card>
```

### Карточка с обводкой

```tsx
<Card variant="outlined">
  <h3>Заголовок</h3>
  <p>Карточка с обводкой</p>
</Card>
```

---

## Композиция компонентов

### Форма с валидацией

```tsx
import { Button, Input, Card } from './design-system/components';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  return (
    <Card variant="elevated">
      <h2>Свяжитесь с нами</h2>
      
      <Input
        label="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        fullWidth
      />
      
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        fullWidth
      />
      
      <Button variant="primary" fullWidth>
        Отправить
      </Button>
    </Card>
  );
}
```

### Карточка темы

```tsx
import { Card, Button } from './design-system/components';

function TopicCard({ title, description, href }) {
  return (
    <Card variant="elevated">
      <h3>{title}</h3>
      <p>{description}</p>
      <Button variant="secondary" href={href}>
        Узнать больше
      </Button>
    </Card>
  );
}
```

---

## Стилизация через токены

Если нужно кастомизировать компоненты, используйте токены напрямую:

```tsx
import { colors, spacing, typography, effects } from './design-system/tokens';

const customStyle = {
  backgroundColor: colors.brand.primary.light,
  padding: spacing.space[8],
  borderRadius: effects.radius.lg,
  fontFamily: typography.fontFamily.serif,
};
```

---

**Последнее обновление:** 13 января 2026

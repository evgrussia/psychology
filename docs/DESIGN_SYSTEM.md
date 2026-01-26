# Emotional Balance — Design System

> Единый дизайн-язык для продукта «Эмоциональный баланс»  
> Mobile-first (Telegram WebApp) + Desktop Admin Panel  
> WCAG 2.2 Level AA Compliant

## Обзор

Дизайн-система «Эмоциональный баланс» создана для обеспечения консистентного пользовательского опыта во всех частях продукта. Система включает:

- ✅ Полный набор токенов (цвета, отступы, типографика, тени)
- ✅ Библиотеку переиспользуемых компонентов
- ✅ Доменные UI-блоки для специфичных задач
- ✅ Паттерны навигации, форм и состояний
- ✅ Поддержку светлой и тёмной темы
- ✅ Соответствие WCAG 2.2 AA

## Структура

### 1. Cover
Обложка с назначением системы и ключевыми принципами дизайна.

### 2. Foundations
Базовые элементы:
- **Сетка**: 8pt Grid System (шаги: 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px)
- **Радиусы**: 8px, 12px, 16px, 24px, pill (9999px)
- **Типографика**: Inter (кириллица), шкала от 12px до 36px
- **Цвета**: Тёплая палитра с бирюзовым primary (#17A2B8) и коралловым secondary (#FFF5F2)
- **Тени**: 5 уровней elevation (0-4)

### 3. Tokens / Variables
CSS Custom Properties для всех токенов:
- `--space-*` — отступы
- `--radius-*` — радиусы скругления
- `--elevation-*` — тени
- `color/*` — цвета (background, foreground, primary, secondary, success, warning, danger, info)
- Поддержка Light/Dark режимов

### 4. Components
Библиотека базовых компонентов:

**Buttons**: primary, secondary, outline, ghost, destructive  
**Inputs**: text, textarea, search, password (с состояниями: default, focus, error, disabled)  
**Select/Dropdown, Checkbox, Radio, Switch**  
**Chips/Tags/Badges**  
**Tabs, Segmented control**  
**Navigation**: Top bar, Bottom nav (mobile), Side nav (desktop)  
**Cards**: различные варианты карточек  
**Lists**: list items с иконками и метаданными  
**Feedback**: Toast, Alert, Tooltip  
**Overlays**: Modal, Sheet, Dialog  
**Progress**: progress bar, spinner, skeleton loaders  
**Forms**: field groups, validation  
**Admin**: Table, Pagination, Filters, Status pills

### 5. Patterns
Готовые паттерны:
- Навигация (mobile bottom nav, desktop side nav, top bar)
- Формы (с валидацией, многошаговые)
- Empty/Error/Loading состояния
- Поиск и фильтры
- Вкладки (Tabs)
- Сообщения обратной связи

### 6. Templates
Доменные UI-блоки:

**Quiz Question Cards**:
- Single choice (одиночный выбор)
- Multi choice (множественный выбор)
- Scale (шкала/слайдер)

**Mood Check-in**:
- Визуальная шкала настроения
- Сохранение записей
- Streak counter

**Content Module Tiles**:
- Образовательные модули
- Статусы: available, in-progress, completed, locked
- Прогресс выполнения

**Booking Slots**:
- Запись к специалистам
- Online/Offline варианты
- Доступность слотов

**Moderation Queue Item**:
- UGC контент на модерации
- Статусы, жалобы, действия (approve/reject)

### 7. Admin Kit
Компоненты для админ-панели:
- Dashboard cards со статистикой
- Sortable tables с bulk actions
- Filters bar
- Status pills
- Side panel/drawer
- Pagination

### 8. A11y Notes
Правила доступности WCAG 2.2 AA:

**Контраст**:
- Текст: минимум 4.5:1
- UI элементы: минимум 3:1
- Крупный текст: минимум 3:1

**Фокус**:
- Видимый outline 2px
- Цвет: var(--focus)
- Offset: 2px

**Touch targets**:
- Mobile: минимум 44×44px
- Отступы между элементами: минимум 8px

**Семантика**:
- Правильные HTML теги
- ARIA-атрибуты
- Alt-тексты для изображений
- Labels для полей ввода

**Ошибки**:
- Не только цвет (цвет + иконка + текст + ARIA)
- Понятные сообщения
- aria-invalid, aria-describedby

## Принципы дизайна

### 1. Спокойствие
Мягкая палитра, плавные переходы, достаточно «воздуха». Никакой визуальной агрессии.

### 2. Поддержка
Понятные паттерны, помощь на каждом шаге, чёткие состояния ошибок и успехов.

### 3. Консистентность
Единые токены, переиспользуемые компоненты, предсказуемое поведение интерфейса.

## Технологии

- **Фреймворк**: React + TypeScript
- **Стили**: Tailwind CSS v4 + CSS Custom Properties
- **Компоненты**: Radix UI (доступные примитивы)
- **Темы**: next-themes (Light/Dark mode)
- **Типографика**: Inter (Google Fonts)
- **Иконки**: Lucide React

## Использование

### В CSS:
```css
.my-element {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-2);
}
```

### В Tailwind:
```tsx
<div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-md">
  Пример элемента
</div>
```

### Импорт компонентов:
```tsx
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/domain/QuizCard';
import { MoodCheckIn } from '@/components/domain/MoodCheckIn';

<Button variant="primary">Кнопка</Button>
<QuizCard variant="single-choice" />
<MoodCheckIn />
```

## Ресурсы

- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Inter Font**: https://fonts.google.com/specimen/Inter

---

**Версия**: 1.0  
**Дата**: Январь 2026  
**Статус**: Production Ready
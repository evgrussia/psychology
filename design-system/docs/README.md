# Emotional Balance — Design System

**Версия:** 1.0  
**Дата:** Январь 2026  
**Уровень доступности:** WCAG 2.2 AA

## Описание

Единый дизайн-язык для продукта «Эмоциональный баланс», охватывающий:
- **Пользовательскую часть** (mobile-first, Telegram WebApp)
- **Административную панель** (desktop-first)

Система построена на принципах спокойствия, поддержки и консистентности, с полным соблюдением стандартов доступности WCAG 2.2 уровня AA.

## Структура

### 1. Cover
Обложка дизайн-системы с описанием назначения и ключевых принципов.

### 2. Foundations
Базовые элементы дизайна:
- **Сетка и отступы:** 8pt Grid System (4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px)
- **Радиусы:** sm (8px), md (12px), lg (16px), xl (24px), pill (9999px)
- **Типографика:** Inter с весами 400/500/600/700
- **Цветовая палитра:** Спокойные цвета с семантическими значениями
- **Высоты (Elevation):** 5 уровней теней для создания глубины

### 3. Tokens & Variables
CSS переменные и токены:
- Цветовые токены (background, foreground, primary, secondary, accent, semantic colors)
- Токены отступов (space-0 до space-16)
- Токены радиусов (radius-sm до radius-pill)
- Поддержка Light/Dark режимов

### 4. Components
Полная библиотека UI компонентов:
- **Buttons:** 5 вариантов × 3 размера × множество состояний
- **Inputs:** Text, Textarea, Select с состояниями (default, focus, error, disabled)
- **Checkboxes, Radios, Switches**
- **Badges & Tags**
- **Cards:** Базовые и специализированные варианты
- **Alerts & Toasts**
- **Tabs & Navigation**
- **Progress & Loading states**
- **List Items**

### 5. Patterns
Готовые паттерны для основных сценариев:
- **Mood Check-in:** Шкала настроения с визуальной обратной связью
- **Quiz Cards:** Single-choice, multi-choice, scale вопросы
- **Content Modules:** Карточки курсов/медитаций с прогрессом
- **Form Patterns:** Валидация, группировка полей, helper текст
- **Empty States:** Пустые списки, ошибки загрузки
- **Loading States:** Скелетоны и индикаторы загрузки

### 6. Templates
Готовые экраны для быстрого старта:
- **Mobile:** Onboarding, Home, Module Detail, Booking, Profile
- **Desktop:** Представлены в разделе Admin Kit

### 7. Admin Kit
Компоненты для административной панели:
- **Dashboard Cards:** Метрики и статистика
- **Filters & Search Bar**
- **Data Tables:** Sortable headers, row selection, bulk actions
- **Pagination:** Навигация по страницам
- **Status Pills:** Визуальные индикаторы статусов
- **Side Panel/Drawer:** Детальная информация

### 8. A11y Notes
Правила доступности WCAG 2.2 AA:
- **Контрастность:** 4.5:1 для текста, 3:1 для UI элементов
- **Focus States:** 2px outline с 2px offset
- **Touch Targets:** 44×44px (mobile), 24×24px минимум (desktop)
- **Состояния ошибок:** Сочетание цвета, иконки и текста
- **Читабельность:** 14-16px минимум, line-height 1.5-1.75

## Технологии

- **Фреймворк:** React 18
- **Стили:** Tailwind CSS v4
- **Типографика:** Inter (Google Fonts)
- **Иконки:** Lucide React
- **Компоненты:** Radix UI + кастомные компоненты
- **Темы:** next-themes для Light/Dark режимов

## Использование

### CSS Variables

```css
.button {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

### Tailwind Classes

```jsx
<button className="bg-primary text-primary-foreground p-4 rounded-md hover:bg-primary/90">
  Button
</button>
```

## Принципы дизайна

### 1. Спокойствие
Мягкая палитра, плавные переходы, достаточно «воздуха». Никакой визуальной агрессии.

### 2. Поддержка
Понятные паттерны, помощь на каждом шаге, чёткие состояния ошибок и успехов.

### 3. Консистентность
Единые токены, переиспользуемые компоненты, предсказуемое поведение интерфейса.

## Цветовая палитра

### Брендовые цвета
- **Primary:** #5B7C99 (мягкий синий)
- **Secondary:** #9B8B9E (мягкий фиолетовый)
- **Accent:** #7DA9A4 (мягкий бирюзовый)

### Семантические цвета
- **Success:** #6B9B7E (зелёный)
- **Warning:** #D4A574 (оранжевый)
- **Danger:** #C97C7C (красный)
- **Info:** #7DA9A4 (бирюзовый)

### Нейтральные цвета
Серая шкала от 50 до 900 для текстов, фонов и границ.

## Доступность

Все компоненты системы соответствуют WCAG 2.2 уровня AA:

- ✅ Контраст текста минимум 4.5:1
- ✅ Контраст UI элементов минимум 3:1
- ✅ Заметные focus-состояния (2px ring)
- ✅ Минимальные размеры кликабельных зон (44×44px mobile)
- ✅ Состояния ошибок не только цветом
- ✅ Поддержка навигации с клавиатуры
- ✅ Семантический HTML и ARIA-метки

## Лицензия

© 2026 Emotional Balance. Все права защищены.

---

**Примечание:** Figma Make не предназначен для сбора персональных данных или защиты конфиденциальной информации. Для production-приложений используйте соответствующие меры безопасности.

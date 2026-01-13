# Полная техническая спецификация дизайна главной страницы Q Psychology

**Источник:** [https://www.qpsychology.com.au/](https://www.qpsychology.com.au/)  
**Дата анализа:** 7 января 2026  
**Цель:** Максимально детальное описание всех визуальных элементов, эффектов, анимаций и стилей для точной реализации

---

## 📐 Содержание

1. [Design Tokens и Системные Переменные](#1-design-tokens-и-системные-переменные)
2. [Типографическая Система](#2-типографическая-система)
3. [Spacing System](#3-spacing-system)
4. [Компоненты UI](#4-компоненты-ui)
5. [Анимации и Transitions](#5-анимации-и-transitions)
6. [Структура Страницы и Секции](#6-структура-страницы-и-секции)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Accessibility Features](#8-accessibility-features)
9. [Z-Index Stack](#9-z-index-stack)

---

## 1. Design Tokens и Системные Переменные

### 1.1 Цветовая Палитра

```css
/* === PRIMARY COLORS === */
--color-brand-primary: #1E3F3D;        /* Глубокий тёмно-зелёный (forest green/pine) */
--color-brand-secondary: #C5DFD8;      /* Мятный/sage green (светлый акцент) */
--color-brand-accent: #A8CDC2;         /* Средний мятный (для hover/active) */

/* === BACKGROUND COLORS === */
--color-bg-primary: #FAF8F4;           /* Светло-кремовый/off-white */
--color-bg-secondary: #F5F2ED;         /* Более тёмный кремовый */
--color-bg-dark: #1E3F3D;              /* Тёмно-зелёный фон */
--color-bg-overlay: rgba(30, 63, 61, 0.85); /* Тёмный оверлей для модальных окон */

/* === TEXT COLORS === */
--color-text-primary: #1E3F3D;         /* Основной текст (тёмно-зелёный) */
--color-text-secondary: #5A7371;       /* Вторичный текст (приглушённый зелёный) */
--color-text-on-dark: #FAF8F4;         /* Текст на тёмном фоне */
--color-text-muted: #8A9D9B;           /* Деактивированный/вспомогательный */

/* === BORDER COLORS === */
--color-border-primary: #E5E0D8;       /* Основные разделители */
--color-border-secondary: #D8D0C5;     /* Более заметные границы */
--color-border-dark: rgba(30, 63, 61, 0.15); /* Границы на светлом */

/* === SHADOW COLORS === */
--shadow-sm: 0 2px 8px rgba(30, 63, 61, 0.08);
--shadow-md: 0 4px 16px rgba(30, 63, 61, 0.12);
--shadow-lg: 0 8px 24px rgba(30, 63, 61, 0.16);
--shadow-xl: 0 12px 32px rgba(30, 63, 61, 0.20);
```

### 1.2 Border Radius

```css
--radius-sm: 8px;                      /* Мелкие элементы */
--radius-md: 12px;                     /* Карточки, поля ввода */
--radius-lg: 20px;                     /* Крупные контейнеры */
--radius-xl: 32px;                     /* Кнопки-пилюли */
--radius-pill: 9999px;                 /* Полное скругление (капсулы) */
--radius-circle: 50%;                  /* Круглые элементы */
```

---

## 2. Типографическая Система

### 2.1 Font Families

```css
/* Serif - для заголовков Hero */
--font-serif: 'Gupter', 'Georgia', 'Times New Roman', serif;
/* Возможные альтернативы: 'Lora', 'Playfair Display', 'Cormorant' */

/* Sans-serif - основной текст и UI */
--font-sans: 'Inter', 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### 2.2 Font Sizes

```css
/* === DESKTOP === */
--font-size-hero: clamp(56px, 7vw, 88px);      /* Огромный заголовок Hero */
--font-size-h1: clamp(40px, 5vw, 56px);        /* H1 в контенте */
--font-size-h2: clamp(32px, 4vw, 44px);        /* H2 секций */
--font-size-h3: clamp(24px, 3vw, 32px);        /* H3 подсекций */
--font-size-h4: clamp(20px, 2.5vw, 24px);      /* H4 */
--font-size-body-lg: 20px;                      /* Крупный body */
--font-size-body: 16px;                         /* Основной body */
--font-size-body-sm: 14px;                      /* Мелкий текст */
--font-size-caption: 12px;                      /* Caption/метки */

/* === MOBILE (overrides) === */
@media (max-width: 768px) {
  --font-size-hero: 40px;
  --font-size-h1: 32px;
  --font-size-h2: 28px;
  --font-size-body-lg: 18px;
}
```

### 2.3 Font Weights

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 2.4 Line Heights

```css
--line-height-tight: 1.1;               /* Крупные заголовки */
--line-height-snug: 1.3;                /* Средние заголовки */
--line-height-normal: 1.5;              /* Body текст */
--line-height-relaxed: 1.7;             /* Комфортный для чтения */
```

### 2.5 Letter Spacing

```css
--letter-spacing-tight: -0.02em;        /* Крупные заголовки */
--letter-spacing-normal: 0;             /* Обычный текст */
--letter-spacing-wide: 0.02em;          /* Заглавные буквы, мелкий текст */
```

---

## 3. Spacing System

### 3.1 Base Scale (8px grid)

```css
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
```

### 3.2 Layout Spacing

```css
--container-max-width: 1280px;          /* Максимальная ширина контента */
--container-padding: var(--space-6);    /* Боковые отступы контейнера */
--section-spacing: var(--space-20);     /* Расстояние между секциями */
--element-spacing: var(--space-8);      /* Между элементами в секции */
```

---

## 4. Компоненты UI

### 4.1 Header (Sticky Capsule)

#### Структура

```html
<header class="header-capsule">
  <div class="header-inner">
    <!-- Left: Logo -->
    <a href="/" class="header-logo">
      <div class="logo-circle">Q</div>
      <span class="logo-text">PSYCHOLOGY</span>
    </a>
    
    <!-- Center: Desktop Navigation -->
    <nav class="header-nav-desktop">
      <a href="/about">About</a>
      <a href="/team">Team</a>
      <div class="nav-dropdown">
        <button>Services <span class="chevron-down"></span></button>
        <div class="dropdown-menu">...</div>
      </div>
      <a href="/fees">Fees</a>
      <a href="/blog">Blog</a>
      <div class="nav-dropdown">
        <button>Locations <span class="chevron-down"></span></button>
        <div class="dropdown-menu">...</div>
      </div>
      <a href="/contact">Contact</a>
    </nav>
    
    <!-- Right: CTA + Menu + Search -->
    <div class="header-actions">
      <a href="/contact" class="btn-pill-cta">
        <span>Reach out to us</span>
        <span class="btn-circle">→</span>
      </a>
      <button class="btn-icon" aria-label="Menu">
        <span class="hamburger-icon"></span>
      </button>
      <button class="btn-icon" aria-label="Search">
        <span class="search-icon"></span>
      </button>
    </div>
  </div>
</header>
```

#### Стили

```css
.header-capsule {
  position: sticky;
  top: var(--space-4);
  z-index: var(--z-header);
  padding: 0 var(--space-6);
  margin: 0 auto;
  max-width: calc(var(--container-max-width) + var(--space-12));
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-primary);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
  background-color: rgba(250, 248, 244, 0.95);
  transition: box-shadow 0.3s ease;
}

.header-inner:hover {
  box-shadow: var(--shadow-lg);
}

/* Logo */
.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--color-text-primary);
}

.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-circle);
  background: white;
  border: 2px solid var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-primary);
}

.logo-text {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

/* Desktop Navigation */
.header-nav-desktop {
  display: none; /* Hidden on mobile */
  gap: var(--space-6);
  align-items: center;
}

@media (min-width: 1024px) {
  .header-nav-desktop {
    display: flex;
  }
}

.header-nav-desktop a,
.header-nav-desktop button {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2) 0;
  transition: color 0.2s ease;
  position: relative;
}

.header-nav-desktop a:hover,
.header-nav-desktop button:hover {
  color: var(--color-brand-accent);
}

/* Underline effect on hover */
.header-nav-desktop a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-brand-accent);
  transition: width 0.3s ease;
}

.header-nav-desktop a:hover::after {
  width: 100%;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-circle);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.btn-icon:hover {
  background: rgba(30, 63, 61, 0.05);
}

.btn-icon:focus-visible {
  outline: 2px solid var(--color-brand-accent);
  outline-offset: 2px;
}
```

#### Mobile Стили

```css
@media (max-width: 1023px) {
  .header-capsule {
    top: var(--space-2);
    padding: 0 var(--space-4);
  }
  
  .header-inner {
    padding: var(--space-2) var(--space-4);
  }
  
  .logo-text {
    display: none; /* Скрываем текст на мобильных */
  }
  
  .btn-pill-cta {
    display: none; /* CTA скрыта на мобильных */
  }
}
```

---

### 4.2 CTA Button (Pill + Circle)

#### Структура

```html
<a href="/contact" class="btn-pill-cta">
  <span class="btn-text">Reach out to us</span>
  <span class="btn-circle">
    <svg class="arrow-icon" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </span>
</a>
```

#### Стили

```css
.btn-pill-cta {
  display: inline-flex;
  align-items: center;
  gap: 0;
  text-decoration: none;
  border-radius: var(--radius-pill);
  background: var(--color-brand-secondary);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.btn-pill-cta:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-pill-cta:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-pill-cta:focus-visible {
  outline: 3px solid var(--color-brand-accent);
  outline-offset: 3px;
}

.btn-text {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-brand-primary);
  transition: color 0.3s ease;
}

.btn-circle {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-circle);
  background: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.arrow-icon {
  width: 20px;
  height: 20px;
  stroke: var(--color-text-on-dark);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover animation */
.btn-pill-cta:hover .btn-circle {
  background: var(--color-brand-accent);
  transform: scale(1.05);
}

.btn-pill-cta:hover .arrow-icon {
  transform: translateX(3px);
}

.btn-pill-cta:hover .btn-text {
  color: var(--color-text-primary);
}
```

#### Варианты

```css
/* Secondary variant */
.btn-pill-cta--secondary {
  background: transparent;
  border: 2px solid var(--color-brand-secondary);
}

.btn-pill-cta--secondary .btn-text {
  color: var(--color-brand-primary);
}

.btn-pill-cta--secondary .btn-circle {
  background: transparent;
  border: 2px solid var(--color-brand-primary);
}

.btn-pill-cta--secondary .arrow-icon {
  stroke: var(--color-brand-primary);
}

/* On dark background */
.btn-pill-cta--on-dark .btn-text {
  color: var(--color-text-on-dark);
}

.btn-pill-cta--on-dark .btn-circle {
  background: var(--color-text-on-dark);
}

.btn-pill-cta--on-dark .arrow-icon {
  stroke: var(--color-brand-primary);
}
```

---

### 4.3 Overlay Menu

#### Структура

```html
<div class="overlay-menu" data-state="closed">
  <div class="overlay-backdrop"></div>
  <div class="overlay-content">
    <div class="overlay-header">
      <a href="/" class="overlay-logo">Q PSYCHOLOGY</a>
      <button class="btn-close" aria-label="Close menu">
        <span class="close-icon">×</span>
      </button>
    </div>
    
    <nav class="overlay-nav">
      <a href="/about" class="overlay-nav-item">ABOUT</a>
      <div class="overlay-nav-divider"></div>
      
      <a href="/team" class="overlay-nav-item">TEAM</a>
      <div class="overlay-nav-divider"></div>
      
      <div class="overlay-nav-accordion">
        <button class="overlay-nav-item overlay-nav-trigger">
          SERVICES
          <span class="chevron-icon">›</span>
        </button>
        <div class="overlay-nav-submenu">
          <a href="/services/general">General Psychology Services</a>
          <a href="/services/gender">Gender Services</a>
          <a href="/services/autism">Autism and ADHD Assessment</a>
          <!-- ... более услуг ... -->
        </div>
      </div>
      <div class="overlay-nav-divider"></div>
      
      <!-- ... другие пункты меню ... -->
    </nav>
    
    <div class="overlay-footer">
      <p class="overlay-copyright">© Q Psychology.</p>
    </div>
  </div>
</div>
```

#### Стили

```css
.overlay-menu {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay-menu);
  pointer-events: none;
}

.overlay-menu[data-state="open"] {
  pointer-events: auto;
}

/* Backdrop */
.overlay-backdrop {
  position: absolute;
  inset: 0;
  background: var(--color-bg-overlay);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-menu[data-state="open"] .overlay-backdrop {
  opacity: 1;
}

/* Content panel */
.overlay-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(400px, 85vw);
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.overlay-menu[data-state="open"] .overlay-content {
  transform: translateX(0);
}

/* Header */
.overlay-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.overlay-logo {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-primary);
  text-decoration: none;
}

.btn-close {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-circle);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--color-text-primary);
  transition: background 0.2s ease;
}

.btn-close:hover {
  background: rgba(30, 63, 61, 0.05);
}

/* Navigation */
.overlay-nav {
  flex: 1;
  padding: var(--space-6);
}

.overlay-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-5) 0;
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-primary);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: color 0.2s ease;
}

.overlay-nav-item:hover {
  color: var(--color-brand-accent);
}

.overlay-nav-divider {
  height: 1px;
  background: var(--color-border-primary);
}

/* Accordion submenu */
.overlay-nav-accordion {
  /* Accordion logic handled in JS */
}

.overlay-nav-submenu {
  display: none;
  padding-left: var(--space-6);
  padding-top: var(--space-4);
  gap: var(--space-3);
}

.overlay-nav-accordion[data-state="open"] .overlay-nav-submenu {
  display: flex;
  flex-direction: column;
}

.overlay-nav-submenu a {
  padding: var(--space-2) 0;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.overlay-nav-submenu a:hover {
  color: var(--color-brand-accent);
}

.chevron-icon {
  font-size: 24px;
  transition: transform 0.3s ease;
}

.overlay-nav-accordion[data-state="open"] .chevron-icon {
  transform: rotate(90deg);
}

/* Footer */
.overlay-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-border-primary);
  text-align: center;
}

.overlay-copyright {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-secondary);
}
```

---

### 4.4 List Rows (Service Links)

#### Структура

```html
<section class="service-list">
  <h2>Our services and areas of clinical expertise</h2>
  
  <div class="list-row-container">
    <a href="/services/general" class="list-row">
      <span class="list-row-text">General Psychology Services</span>
      <span class="list-row-icon">
        <svg class="arrow-circle" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11"/>
          <path d="M8 12h8M12 8l4 4-4 4"/>
        </svg>
      </span>
    </a>
    <div class="list-row-divider"></div>
    
    <a href="/services/gender" class="list-row">
      <span class="list-row-text">Gender Services</span>
      <span class="list-row-icon">
        <svg class="arrow-circle" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11"/>
          <path d="M8 12h8M12 8l4 4-4 4"/>
        </svg>
      </span>
    </a>
    <div class="list-row-divider"></div>
    
    <!-- ... более услуг ... -->
  </div>
</section>
```

#### Стили

```css
.service-list {
  padding: var(--space-20) 0;
}

.service-list h2 {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-12);
  padding-bottom: var(--space-6);
  border-bottom: 2px solid var(--color-border-primary);
}

.list-row-container {
  display: flex;
  flex-direction: column;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) 0;
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.list-row:hover {
  padding-left: var(--space-4);
  background: linear-gradient(
    90deg,
    rgba(197, 223, 216, 0.1) 0%,
    transparent 100%
  );
}

.list-row-text {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-medium);
  transition: color 0.3s ease;
}

.list-row:hover .list-row-text {
  color: var(--color-brand-accent);
}

.list-row-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.arrow-circle {
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-row:hover .arrow-circle {
  transform: translateX(4px);
}

.arrow-circle circle {
  fill: none;
  stroke: var(--color-brand-primary);
  stroke-width: 1.5;
}

.arrow-circle path {
  stroke: var(--color-brand-primary);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.list-row-divider {
  height: 1px;
  background: var(--color-border-primary);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .list-row-text {
    font-size: var(--font-size-body-lg);
  }
  
  .list-row-icon {
    width: 36px;
    height: 36px;
  }
  
  .list-row {
    padding: var(--space-4) 0;
  }
}
```

---

### 4.5 Accordion Component

#### Структура

```html
<div class="accordion" data-state="closed">
  <button class="accordion-trigger" aria-expanded="false">
    <span class="accordion-title">More information</span>
    <span class="accordion-icon">+</span>
  </button>
  
  <div class="accordion-content">
    <div class="accordion-inner">
      <p>Контент аккордеона...</p>
    </div>
  </div>
</div>
```

#### Стили

```css
.accordion {
  border-top: 1px solid var(--color-border-primary);
}

.accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  transition: color 0.2s ease;
}

.accordion-trigger:hover {
  color: var(--color-brand-accent);
}

.accordion-trigger:focus-visible {
  outline: 2px solid var(--color-brand-accent);
  outline-offset: 4px;
}

.accordion-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: var(--font-weight-light);
  border-radius: var(--radius-circle);
  border: 1px solid var(--color-border-primary);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion[data-state="open"] .accordion-icon {
  transform: rotate(45deg);
}

.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.accordion[data-state="open"] .accordion-content {
  grid-template-rows: 1fr;
}

.accordion-inner {
  min-height: 0;
  padding-bottom: var(--space-6);
}

.accordion-inner p {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

/* Respects reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .accordion-content,
  .accordion-icon {
    transition: none;
  }
}
```

---

## 5. Анимации и Transitions

### 5.1 Timing Functions

```css
/* Easing curves */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### 5.2 Duration Tokens

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 400ms;
--duration-slower: 600ms;
```

### 5.3 Common Transitions

```css
/* Hover lift effect */
.hover-lift {
  transition: 
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

/* Slide in from right */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.4 Scroll-triggered Animations

```css
/* Fade up on scroll */
.scroll-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: 
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-out);
}

.scroll-fade-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 6. Структура Страницы и Секции

### 6.1 Hero Section

```html
<section class="hero">
  <div class="hero-background">
    <img src="/images/hero.jpg" alt="" class="hero-image"/>
    <div class="hero-overlay"></div>
  </div>
  
  <div class="hero-content">
    <div class="hero-inner">
      <h1 class="hero-title">
        Inclusive Psychologists in<br/>
        Melbourne, Geelong & Colac
      </h1>
      
      <div class="hero-text">
        <p>Q Psychology provides high quality, best-practice mental health 
        support to clients and the community. We are leaders in LGBTQIA+ 
        affirming and neuroaffirming mental healthcare. We have clinics 
        across Melbourne in <strong>Carlton</strong> and <strong>St Kilda</strong>, 
        as well as in <strong>Geelong</strong> and <strong>Colac</strong>. 
        Appointments are available <strong>Monday to Saturday</strong>, 
        including <strong>evening appointments</strong>.</p>
      </div>
      
      <a href="#explore" class="scroll-prompt">
        <span>Scroll to explore</span>
        <svg class="scroll-icon" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </a>
    </div>
  </div>
</section>
```

#### Стили Hero

```css
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(30, 63, 61, 0.4) 0%,
    rgba(30, 63, 61, 0.55) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--container-max-width);
  padding: var(--container-padding);
}

.hero-inner {
  max-width: 900px;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-hero);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-on-dark);
  margin-bottom: var(--space-8);
}

.hero-text {
  font-size: var(--font-size-body-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-on-dark);
  margin-bottom: var(--space-12);
  max-width: 700px;
}

.hero-text strong {
  font-weight: var(--font-weight-semibold);
}

/* Scroll prompt */
.scroll-prompt {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-text-on-dark);
  font-size: var(--font-size-body-sm);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
  transition: transform 0.3s ease;
}

.scroll-prompt:hover {
  transform: translateY(4px);
}

.scroll-icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  animation: scrollBounce 2s ease-in-out infinite;
}

@keyframes scrollBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .hero {
    min-height: 100svh; /* Safe area height */
  }
  
  .hero-title br {
    display: none;
  }
}
```

---

### 6.2 Announcement Section (Carlton: We're Moving!)

```html
<section class="announcement-section">
  <div class="announcement-content">
    <h2 class="announcement-title">Carlton: We're Moving!</h2>
    
    <p class="announcement-text">
      From <strong>30 September 2025</strong>, Q Psychology's Carlton office 
      will be moving (only a short distance) to Level 1, 52-54 Rathdowne Street, 
      Carlton - entry via Faraday Street. There is no change to the location 
      of our other clinics.
    </p>
    
    <div class="accordion" data-state="closed">
      <button class="accordion-trigger">
        <span>More information</span>
        <span class="accordion-icon">+</span>
      </button>
      <div class="accordion-content">
        <div class="accordion-inner">
          <p>Дополнительная информация о переезде...</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

#### Стили Announcement

```css
.announcement-section {
  background: var(--color-brand-primary);
  color: var(--color-text-on-dark);
  padding: var(--space-16) var(--container-padding);
}

.announcement-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.announcement-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-6);
}

.announcement-text {
  font-size: var(--font-size-body-lg);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-8);
}

.announcement-text strong {
  font-weight: var(--font-weight-semibold);
}

/* Accordion overrides for dark background */
.announcement-section .accordion {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.announcement-section .accordion-trigger {
  color: var(--color-text-on-dark);
}

.announcement-section .accordion-icon {
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--color-text-on-dark);
}

.announcement-section .accordion-inner p {
  color: rgba(250, 248, 244, 0.85);
}
```

---

### 6.3 Clinics Section

```html
<section class="clinics-section">
  <div class="clinics-container">
    <h2 class="section-title">Our psychology clinics</h2>
    
    <div class="clinics-grid">
      <article class="clinic-card">
        <h3 class="clinic-name">Carlton</h3>
        <p class="clinic-address">Level 1, 52-54 Rathdowne St, Carlton VIC 3053</p>
        <a href="/clinics/carlton" class="btn-clinic">
          <span>See clinic</span>
          <svg class="arrow-icon" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </article>
      
      <div class="clinic-divider"></div>
      
      <article class="clinic-card">
        <h3 class="clinic-name">St Kilda</h3>
        <p class="clinic-address">99 Wellington Street, St Kilda, VIC 3182</p>
        <a href="/clinics/st-kilda" class="btn-clinic">
          <span>See clinic</span>
          <svg class="arrow-icon" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </article>
      
      <!-- ... остальные клиники ... -->
    </div>
  </div>
</section>
```

#### Стили Clinics

```css
.clinics-section {
  padding: var(--space-20) var(--container-padding);
  background: var(--color-bg-primary);
}

.clinics-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.section-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-12);
  padding-bottom: var(--space-6);
  border-bottom: 2px solid var(--color-border-primary);
}

.clinics-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.clinic-card {
  padding: var(--space-8) 0;
}

.clinic-name {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.clinic-address {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--space-4);
}

.btn-clinic {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 2px solid var(--color-brand-primary);
  border-radius: var(--radius-pill);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-brand-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-clinic:hover {
  background: var(--color-brand-primary);
  color: var(--color-text-on-dark);
}

.btn-clinic .arrow-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  transition: transform 0.3s ease;
}

.btn-clinic:hover .arrow-icon {
  transform: translateX(3px);
}

.clinic-divider {
  height: 1px;
  background: var(--color-border-primary);
}

/* Desktop grid layout */
@media (min-width: 768px) {
  .clinics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-12);
  }
  
  .clinic-divider {
    display: none;
  }
}
```

---

### 6.4 Footer

```html
<footer class="footer">
  <div class="footer-container">
    <div class="footer-top">
      <nav class="footer-nav">
        <a href="/privacy">Privacy Policy</a>
        <span class="footer-divider">•</span>
        <a href="/staff">Staff resources</a>
      </nav>
    </div>
    
    <div class="footer-middle">
      <p class="footer-acknowledgement">
        Q Psychology respectfully acknowledges the traditional owners of the lands 
        on which we operate. We pay respects to elders past and present, and uphold 
        their continuing relationship to this land.
      </p>
    </div>
    
    <div class="footer-bottom">
      <p class="footer-copyright">© 2026 Q Psychology. All Rights Reserved.</p>
      <a href="https://headsunder.com" class="footer-credit" target="_blank" rel="noopener">
        Site by Heads Under™
      </a>
    </div>
    
    <div class="footer-crisis">
      <p>
        <strong>If you are in crisis:</strong> please contact Lifeline on 13 11 14 
        or Emergency services on 000.
      </p>
    </div>
  </div>
</footer>
```

#### Стили Footer

```css
.footer {
  background: var(--color-brand-primary);
  color: var(--color-text-on-dark);
  padding: var(--space-16) var(--container-padding) var(--space-8);
}

.footer-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.footer-nav a {
  color: var(--color-text-on-dark);
  text-decoration: none;
  font-size: var(--font-size-body);
  transition: opacity 0.2s ease;
}

.footer-nav a:hover {
  opacity: 0.7;
}

.footer-divider {
  color: rgba(250, 248, 244, 0.3);
}

.footer-acknowledgement {
  font-size: var(--font-size-body-lg);
  line-height: var(--line-height-relaxed);
  color: rgba(250, 248, 244, 0.9);
  max-width: 700px;
  font-style: italic;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-top: var(--space-8);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.footer-copyright {
  font-size: var(--font-size-body-sm);
  color: rgba(250, 248, 244, 0.7);
}

.footer-credit {
  font-size: var(--font-size-body-sm);
  color: rgba(250, 248, 244, 0.7);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.footer-credit:hover {
  color: var(--color-text-on-dark);
}

.footer-crisis {
  background: var(--color-brand-secondary);
  color: var(--color-brand-primary);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body-sm);
}

.footer-crisis strong {
  font-weight: var(--font-weight-semibold);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

---

## 7. Responsive Breakpoints

```css
/* Mobile first approach */

/* Extra small devices (phones) */
/* Base styles (no media query needed) */

/* Small devices (landscape phones) */
@media (min-width: 576px) {
  /* Container adjustments */
}

/* Medium devices (tablets) */
@media (min-width: 768px) {
  /* Show more columns in grids */
  /* Adjust typography sizes */
}

/* Large devices (desktops) */
@media (min-width: 1024px) {
  /* Show desktop navigation */
  /* Multi-column layouts */
}

/* Extra large devices (wide desktops) */
@media (min-width: 1280px) {
  /* Maximum content width applied */
  /* More comfortable spacing */
}

/* Ultra wide (4K displays) */
@media (min-width: 1920px) {
  /* Scale up slightly if needed */
}
```

---

## 8. Accessibility Features

### 8.1 Focus Styles

```css
/* Global focus visible styles */
*:focus-visible {
  outline: 3px solid var(--color-brand-accent);
  outline-offset: 3px;
}

/* Remove default outline (only when focus-visible is supported) */
*:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline-width: 4px;
    outline-offset: 4px;
  }
}
```

### 8.2 Skip Links

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--color-brand-primary);
  color: var(--color-text-on-dark);
  padding: var(--space-4) var(--space-6);
  text-decoration: none;
  z-index: 9999;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
}
```

### 8.3 ARIA Attributes

```html
<!-- Buttons that control other elements -->
<button 
  aria-expanded="false"
  aria-controls="menu-id"
  aria-label="Open menu"
>

<!-- Modal/Overlay -->
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>

<!-- Accordion -->
<div>
  <button 
    aria-expanded="false"
    aria-controls="accordion-content-1"
  >
  <div id="accordion-content-1" aria-hidden="true">
</div>

<!-- Live regions for dynamic updates -->
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content -->
</div>
```

### 8.4 Screen Reader Only Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## 9. Z-Index Stack

```css
/* Z-index system (от меньшего к большему) */
:root {
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-header: 1200;
  --z-overlay: 1300;
  --z-overlay-menu: 1400;
  --z-modal: 1500;
  --z-toast: 1600;
  --z-tooltip: 1700;
}
```

---

## 10. Дополнительные Эффекты и Детали

### 10.1 Search Modal

```html
<div class="search-modal" data-state="closed">
  <div class="search-backdrop"></div>
  <div class="search-content">
    <form class="search-form" role="search">
      <input 
        type="search" 
        placeholder="Search here" 
        class="search-input"
        aria-label="Search"
      />
      <button type="submit" class="search-submit" aria-label="Submit search">
        <svg class="search-icon" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
      </button>
    </form>
    <button class="search-close" aria-label="Close search">×</button>
  </div>
</div>
```

```css
.search-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 100px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.search-modal[data-state="open"] {
  opacity: 1;
  pointer-events: auto;
}

.search-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(30, 63, 61, 0.7);
  backdrop-filter: blur(4px);
}

.search-content {
  position: relative;
  width: min(600px, 90vw);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-xl);
  transform: translateY(-20px);
  transition: transform 0.3s ease;
}

.search-modal[data-state="open"] .search-content {
  transform: translateY(0);
}

.search-form {
  display: flex;
  gap: var(--space-3);
}

.search-input {
  flex: 1;
  padding: var(--space-4);
  font-size: var(--font-size-body-lg);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text-primary);
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: var(--color-brand-accent);
  outline: none;
}

.search-submit {
  padding: var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-brand-primary);
  color: var(--color-text-on-dark);
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-submit:hover {
  background: var(--color-brand-accent);
}

.search-close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  border: none;
  background: white;
  border-radius: var(--radius-circle);
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background 0.2s ease;
}

.search-close:hover {
  background: var(--color-border-primary);
}
```

---

### 10.2 Loading States (Preloader)

```html
<div class="preloader" data-state="loading">
  <div class="preloader-content">
    <div class="preloader-logo">
      <div class="logo-circle">Q</div>
      <span class="logo-text">PSYCHOLOGY</span>
    </div>
  </div>
</div>
```

```css
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--color-brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease;
}

.preloader[data-state="loaded"] {
  opacity: 0;
  pointer-events: none;
}

.preloader-content {
  text-align: center;
}

.preloader-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  animation: fadeInUp 0.6s ease;
}

.preloader .logo-circle {
  width: 80px;
  height: 80px;
  font-size: 40px;
  background: white;
  color: var(--color-brand-primary);
  animation: pulse 2s ease-in-out infinite;
}

.preloader .logo-text {
  color: white;
  font-size: 18px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
```

---

## 11. JavaScript Interactions (Псевдокод)

### 11.1 Menu Toggle

```javascript
// Открытие/закрытие overlay menu
const menuButton = document.querySelector('[data-menu-button]');
const overlayMenu = document.querySelector('[data-overlay-menu]');
const closeButton = document.querySelector('[data-menu-close]');

function toggleMenu() {
  const isOpen = overlayMenu.dataset.state === 'open';
  overlayMenu.dataset.state = isOpen ? 'closed' : 'open';
  menuButton.setAttribute('aria-expanded', !isOpen);
  
  if (!isOpen) {
    // Trap focus inside menu
    trapFocus(overlayMenu);
  } else {
    // Return focus to trigger button
    menuButton.focus();
  }
}

menuButton.addEventListener('click', toggleMenu);
closeButton.addEventListener('click', toggleMenu);

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlayMenu.dataset.state === 'open') {
    toggleMenu();
  }
});
```

### 11.2 Accordion

```javascript
// Accordion toggle
document.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const accordion = trigger.closest('[data-accordion]');
    const isOpen = accordion.dataset.state === 'open';
    
    accordion.dataset.state = isOpen ? 'closed' : 'open';
    trigger.setAttribute('aria-expanded', !isOpen);
  });
});
```

### 11.3 Smooth Scroll

```javascript
// Smooth scroll to anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
```

### 11.4 Scroll Animations

```javascript
// Intersection Observer для анимаций при скролле
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-scroll-animate]').forEach(el => {
  observer.observe(el);
});
```

---

## 12. Чеклист реализации

### Обязательные элементы:

- [ ] Все цвета из палитры определены как CSS custom properties
- [ ] Типографическая система с clamp() для адаптивных размеров
- [ ] Spacing system на базе 8px grid
- [ ] Sticky header с капсульным дизайном и тенью
- [ ] CTA-кнопки "пилюля + круг" со всеми состояниями
- [ ] Overlay menu с анимацией и focus trap
- [ ] Аккордеоны с плавной анимацией
- [ ] List rows с hover-эффектами
- [ ] Hero секция с оверлеем и адаптивной типографикой
- [ ] Footer со всеми секциями
- [ ] Search modal
- [ ] Preloader/splash screen
- [ ] Focus styles для accessibility
- [ ] Prefers-reduced-motion support
- [ ] Responsive breakpoints
- [ ] Z-index system
- [ ] Skip links
- [ ] ARIA attributes

### Тестирование:

- [ ] Keyboard navigation работает везде
- [ ] Screen reader accessibility
- [ ] Mobile touch targets минимум 44x44px
- [ ] Все интерактивные элементы имеют visible focus states
- [ ] Анимации отключаются при prefers-reduced-motion
- [ ] Контрастность текста соответствует WCAG AA (минимум 4.5:1)
- [ ] Все изображения имеют alt text
- [ ] Формы имеют labels
- [ ] Модальные окна закрываются на Escape
- [ ] Responsive на всех брейкпоинтах

---

## 13. Примечания по имплементации

1. **Шрифты**: Необходимо приобрести или найти близкие аналоги указанных шрифтов
2. **Изображения**: Требуются качественные фотографии для hero секций
3. **Иконки**: Рекомендуется использовать встроенные SVG для лучшей производительности
4. **Performance**: Оптимизировать изображения (WebP/AVIF), использовать lazy loading
5. **SEO**: Добавить meta теги, structured data, Open Graph
6. **Analytics**: Интегрировать отслеживание взаимодействий
7. **Forms**: Добавить валидацию и обработку ошибок
8. **Локализация**: Подготовить структуру для мультиязычности если требуется

---

**Конец документа**

_Последнее обновление: 7 января 2026_

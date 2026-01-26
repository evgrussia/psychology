# Техническая спецификация: Phase 6 — Frontend Integration

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** Draft  
**Основано на:** `docs/Development-Phase-Plan.md`, `docs/Design-Handoff.md`, `docs/api/api-contracts.md`, `docs/Tracking-Plan.md`, `docs/Accessibility-A11y-Requirements.md`

---

## 1) Обзор и цели

### 1.1 Назначение документа

Этот документ описывает детальную техническую спецификацию для **Phase 6: Frontend Integration** из плана разработки. Документ содержит:

- Архитектуру frontend приложения
- Технологический стек и обоснование выбора
- Детальную структуру проекта
- Интеграцию Design System
- Реализацию всех экранов Release 1
- Интеграцию с Backend API
- Роутинг и навигацию
- Управление состоянием
- Аналитику и трекинг
- Accessibility требования
- Производительность и оптимизацию
- Тестирование
- Деплой и CI/CD

### 1.2 Цели Phase 6

**Основные цели:**
1. ✅ Создать работающий frontend на основе готового Design System
2. ✅ Реализовать все экраны Release 1 согласно `docs/information-architecture.md`
3. ✅ Интегрировать frontend с Backend API (Phase 5)
4. ✅ Обеспечить полную навигацию и роутинг
5. ✅ Реализовать обработку всех состояний (loading/error/success/empty)
6. ✅ Интегрировать аналитику согласно `docs/Tracking-Plan.md`
7. ✅ Обеспечить соответствие WCAG 2.2 AA

**Выходные артефакты:**
- Работающий frontend приложение
- Все экраны Release 1 реализованы
- Интегрированный Design System
- Полная интеграция с Backend API
- Аналитика настроена и работает
- Accessibility проверки пройдены

**Оценка:** XL (1+ месяц)

---

## 2) Архитектура frontend приложения

### 2.1 Общая архитектура

Frontend приложение следует принципам:

- **Component-based architecture** (React компоненты)
- **Separation of concerns** (UI, логика, данные)
- **Reusability** (переиспользование компонентов Design System)
- **Type safety** (TypeScript)
- **Performance** (code splitting, lazy loading, оптимизация)

### 2.2 Слои архитектуры

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Pages, Screens, Layout Components)    │
├─────────────────────────────────────────┤
│         Component Layer                 │
│  (UI Components, Domain Components)    │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (Hooks, Services, State Management)    │
├─────────────────────────────────────────┤
│         Data Layer                      │
│  (API Client, Cache, Local Storage)     │
└─────────────────────────────────────────┘
```

### 2.3 Принципы организации кода

1. **Feature-based structure** для страниц и бизнес-логики
2. **Shared components** для переиспользуемых UI компонентов
3. **Domain components** для доменных сущностей (Quiz, Booking, Diary)
4. **Hooks** для переиспользуемой логики
5. **Services** для API вызовов и бизнес-логики
6. **Utils** для утилитарных функций

---

## 3) Технологический стек

### 3.1 Выбор фреймворка

**Рекомендация: Next.js 14+ (App Router)**

**Обоснование:**
- ✅ SSR/SSG для SEO (важно для публичных страниц)
- ✅ File-based routing (соответствует структуре из IA)
- ✅ Built-in оптимизация (images, fonts, scripts)
- ✅ API Routes (если нужны proxy endpoints)
- ✅ TypeScript support из коробки
- ✅ Хорошая экосистема и документация

**Альтернатива:** React 18 + Vite (если SSR не критичен)

### 3.2 Полный стек

#### Core
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **React:** 18.2+

#### Styling
- **CSS Framework:** Tailwind CSS v4
- **Design Tokens:** CSS Custom Properties (из `design_system/src/styles/theme.css`)
- **Component Library:** Radix UI (для доступных примитивов)

#### State Management
- **Server State:** React Query / TanStack Query v5
- **Client State:** Zustand (для простого глобального состояния)
- **Form State:** React Hook Form + Zod (валидация)

#### Routing & Navigation
- **Router:** Next.js App Router (встроенный)
- **Navigation:** Next.js `Link` и `useRouter`

#### API Client
- **HTTP Client:** Axios или Fetch API (native)
- **Type Safety:** OpenAPI TypeScript Generator (если есть OpenAPI spec)

#### Analytics
- **Event Tracking:** Custom tracking layer (см. раздел 11)
- **Privacy:** Соблюдение Tracking Plan (без PII)

#### Testing
- **Unit/Integration:** Vitest
- **E2E:** Playwright
- **Component Testing:** React Testing Library

#### Build & Dev Tools
- **Package Manager:** pnpm (или npm/yarn)
- **Linting:** ESLint + TypeScript ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript (strict mode)

#### Accessibility
- **Testing:** axe-core, Lighthouse
- **Screen Reader Testing:** NVDA (Windows), VoiceOver (macOS)

---

## 4) Структура проекта

### 4.1 Полная структура директорий

```
frontend/
├── .env.local                    # Локальные переменные окружения
├── .env.example                  # Пример переменных окружения
├── .eslintrc.json                # ESLint конфигурация
├── .prettierrc                   # Prettier конфигурация
├── next.config.js                # Next.js конфигурация
├── tailwind.config.js            # Tailwind конфигурация
├── tsconfig.json                 # TypeScript конфигурация
├── package.json                  # Зависимости
├── pnpm-lock.yaml                # Lock file
│
├── public/                       # Статические файлы
│   ├── images/                   # Изображения
│   ├── icons/                    # Иконки
│   └── favicon.ico
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Главная страница
│   │   ├── loading.tsx           # Loading UI
│   │   ├── error.tsx              # Error boundary
│   │   ├── not-found.tsx         # 404 страница
│   │   │
│   │   ├── (marketing)/          # Marketing pages (route group)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Главная
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── how-it-works/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (content)/            # Content pages
│   │   │   ├── layout.tsx
│   │   │   ├── topics/
│   │   │   │   ├── page.tsx      # Хаб тем
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Лендинг темы
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx      # Список статей
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Статья
│   │   │   ├── resources/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── curated/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   └── glossary/
│   │   │       ├── page.tsx
│   │   │       └── [term]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (interactive)/        # Interactive tools
│   │   │   ├── layout.tsx
│   │   │   ├── quiz/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── navigator/
│   │   │   │   └── page.tsx
│   │   │   ├── boundaries/
│   │   │   │   ├── scripts/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── rituals/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── booking/              # Booking flow
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Выбор услуги
│   │   │   ├── slot/
│   │   │   │   └── page.tsx      # Выбор слота
│   │   │   ├── form/
│   │   │   │   └── page.tsx      # Анкета
│   │   │   ├── payment/
│   │   │   │   └── page.tsx      # Оплата
│   │   │   ├── confirm/
│   │   │   │   └── page.tsx      # Подтверждение
│   │   │   └── no-slots/
│   │   │       └── page.tsx     # Нет слотов
│   │   │
│   │   ├── cabinet/              # Client Cabinet
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── diary/
│   │   │   │   └── page.tsx
│   │   │   └── materials/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                # Admin Panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── content/
│   │   │   │   └── page.tsx
│   │   │   └── moderation/
│   │   │       └── page.tsx
│   │   │
│   │   └── legal/                # Legal pages
│   │       ├── privacy/
│   │       │   └── page.tsx
│   │       ├── personal-data-consent/
│   │       │   └── page.tsx
│   │       ├── offer/
│   │       │   └── page.tsx
│   │       ├── disclaimer/
│   │       │   └── page.tsx
│   │       └── cookies/
│   │           └── page.tsx
│   │
│   ├── components/               # React компоненты
│   │   ├── ui/                   # Базовые UI компоненты (из Design System)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...               # Все компоненты из design_system/src/app/components/ui/
│   │   │
│   │   ├── domain/              # Доменные компоненты (из Design System)
│   │   │   ├── QuizCard.tsx
│   │   │   ├── MoodCheckIn.tsx
│   │   │   ├── ContentModuleTile.tsx
│   │   │   ├── BookingSlot.tsx
│   │   │   └── ModerationQueueItem.tsx
│   │   │
│   │   ├── layout/               # Layout компоненты
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx       # Для admin
│   │   │   └── SkipLink.tsx      # A11y skip link
│   │   │
│   │   ├── features/             # Feature-specific компоненты
│   │   │   ├── booking/
│   │   │   │   ├── ServiceSelector.tsx
│   │   │   │   ├── SlotCalendar.tsx
│   │   │   │   ├── IntakeForm.tsx
│   │   │   │   └── PaymentForm.tsx
│   │   │   ├── quiz/
│   │   │   │   ├── QuizStart.tsx
│   │   │   │   ├── QuizProgress.tsx
│   │   │   │   ├── QuizResult.tsx
│   │   │   │   └── CrisisBanner.tsx
│   │   │   ├── content/
│   │   │   │   ├── ArticleCard.tsx
│   │   │   │   ├── ResourceCard.tsx
│   │   │   │   └── TopicCard.tsx
│   │   │   └── cabinet/
│   │   │       ├── AppointmentCard.tsx
│   │   │       ├── DiaryEntry.tsx
│   │   │       └── MaterialCard.tsx
│   │   │
│   │   └── shared/               # Shared компоненты
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── SeoHead.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Аутентификация
│   │   ├── useApi.ts             # API вызовы
│   │   ├── useTracking.ts        # Аналитика
│   │   ├── useLocalStorage.ts    # Local storage
│   │   └── useDebounce.ts        # Debounce
│   │
│   ├── services/                 # Бизнес-логика и API
│   │   ├── api/                  # API клиент
│   │   │   ├── client.ts         # Axios instance
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── content.ts        # Content endpoints
│   │   │   ├── booking.ts         # Booking endpoints
│   │   │   ├── interactive.ts    # Interactive endpoints
│   │   │   └── cabinet.ts        # Cabinet endpoints
│   │   │
│   │   ├── tracking/             # Analytics service
│   │   │   ├── tracker.ts        # Основной трекер
│   │   │   ├── events.ts         # Event definitions
│   │   │   └── privacy.ts        # Privacy validation
│   │   │
│   │   └── storage/              # Storage services
│   │       ├── localStorage.ts
│   │       └── sessionStorage.ts
│   │
│   ├── lib/                      # Утилиты и хелперы
│   │   ├── utils.ts              # Общие утилиты
│   │   ├── validators.ts         # Валидаторы (Zod schemas)
│   │   ├── formatters.ts         # Форматирование (даты, цены)
│   │   ├── constants.ts          # Константы
│   │   └── types.ts              # Общие типы
│   │
│   ├── store/                    # State management (Zustand)
│   │   ├── authStore.ts          # Auth state
│   │   ├── uiStore.ts            # UI state (theme, modals)
│   │   └── bookingStore.ts        # Booking flow state
│   │
│   ├── styles/                   # Глобальные стили
│   │   ├── globals.css           # Глобальные стили
│   │   └── theme.css             # Импорт из Design System
│   │
│   └── types/                    # TypeScript типы
│       ├── api.ts                # API response types
│       ├── domain.ts             # Domain types
│       └── tracking.ts           # Tracking event types
│
├── tests/                        # Тесты
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── __mocks__/
│
├── docs/                         # Документация
│   ├── README.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
│
└── scripts/                      # Скрипты
    ├── generate-types.ts         # Генерация типов из OpenAPI
    └── check-a11y.ts             # A11y проверки
```

### 4.2 Импорт компонентов из Design System

**Стратегия:** Копирование или симлинки компонентов из `design_system/src/app/components/` в `frontend/src/components/`

**Рекомендация:** Создать скрипт для синхронизации компонентов:

```bash
# scripts/sync-design-system.sh
#!/bin/bash
# Копирует компоненты из design_system в frontend
cp -r design_system/src/app/components/ui/* frontend/src/components/ui/
cp -r design_system/src/app/components/domain/* frontend/src/components/domain/
cp design_system/src/styles/theme.css frontend/src/styles/theme.css
```

**Альтернатива:** Использовать npm package или monorepo (если Design System вынесен в отдельный пакет)

---

## 5) Интеграция Design System

### 5.1 Импорт токенов

**Шаг 1:** Скопировать `design_system/src/styles/theme.css` в `frontend/src/styles/theme.css`

**Шаг 2:** Импортировать в `globals.css`:

```css
/* frontend/src/styles/globals.css */
@import './theme.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.2 Настройка Tailwind

**tailwind.config.js:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Используем CSS Custom Properties из theme.css
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        // ... остальные цвета
      },
      spacing: {
        // Используем токены из theme.css
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        // ... остальные отступы
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        // ... остальные радиусы
      },
      boxShadow: {
        '1': 'var(--elevation-1)',
        '2': 'var(--elevation-2)',
        // ... остальные тени
      },
    },
  },
  plugins: [],
}
```

### 5.3 Импорт компонентов

**Пример импорта UI компонента:**

```tsx
// frontend/src/components/ui/button.tsx
// Копируем из design_system/src/app/components/ui/button.tsx
// Адаптируем пути импортов при необходимости
```

**Пример использования:**

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { QuizCard } from '@/components/domain/QuizCard';

export function MyPage() {
  return (
    <Card>
      <CardHeader>
        <h1>Заголовок</h1>
      </CardHeader>
      <CardContent>
        <QuizCard variant="single-choice" />
        <Button variant="default">Кнопка</Button>
      </CardContent>
    </Card>
  );
}
```

### 5.4 Проверка соответствия

**Чеклист интеграции Design System:**

- [ ] Все токены из `theme.css` доступны в CSS
- [ ] Все UI компоненты скопированы и работают
- [ ] Все domain компоненты скопированы и работают
- [ ] Tailwind конфигурация использует токены
- [ ] Темная тема работает (если поддерживается)
- [ ] Все компоненты типизированы (TypeScript)
- [ ] Нет ошибок импорта

---

## 6) Реализация экранов

### 6.1 Стратегия реализации

**Подход:** Использовать готовые экраны из `design_system/src/app/components/ScreensWeb.tsx` как референс, адаптировать под Next.js App Router.

### 6.2 Группировка экранов по приоритету

#### P0 (Критичные для Release 1)

1. **Marketing Pages**
   - `/` — Главная страница
   - `/about` — О проекте
   - `/how-it-works` — Как работает

2. **Booking Flow**
   - `/booking` — Выбор услуги
   - `/booking/slot` — Выбор слота
   - `/booking/form` — Анкета
   - `/booking/payment` — Оплата
   - `/booking/confirm` — Подтверждение

3. **Interactive Tools (базовые)**
   - `/quiz/[id]` — Квизы (Start, Progress, Result, Crisis)
   - `/navigator` — Навигатор состояния

4. **Content Pages (базовые)**
   - `/topics` — Хаб тем
   - `/topics/[slug]` — Лендинг темы
   - `/blog` — Список статей
   - `/blog/[slug]` — Статья

5. **Client Cabinet**
   - `/cabinet` — Личный кабинет
   - `/cabinet/appointments` — Встречи
   - `/cabinet/diary` — Дневники

6. **Legal Pages**
   - `/legal/privacy` — Политика конфиденциальности
   - `/legal/personal-data-consent` — Согласие на ПДн
   - `/legal/offer` — Оферта
   - `/legal/disclaimer` — Дисклеймер

#### P1 (Важные, но не блокирующие)

- `/resources` — Ресурсы
- `/boundaries/scripts` — Скрипты границ
- `/rituals` — Мини-ритуалы
- `/curated` — Подборки
- `/glossary` — Глоссарий

#### P2 (Можно отложить)

- `/admin` — Админ-панель (может быть отдельным приложением)
- Расширенные интерактивы

### 6.3 Пример реализации экрана

**Пример: Главная страница (`/`)**

```tsx
// src/app/(marketing)/page.tsx
import { Metadata } from 'next';
import { HeroSection } from '@/components/features/marketing/HeroSection';
import { ProblemCards } from '@/components/features/marketing/ProblemCards';
import { TrustBlocks } from '@/components/features/marketing/TrustBlocks';
import { FirstStepSection } from '@/components/features/marketing/FirstStepSection';
import { FAQSection } from '@/components/features/marketing/FAQSection';
import { CTASection } from '@/components/features/marketing/CTASection';

export const metadata: Metadata = {
  title: 'Эмоциональный баланс — Психологическая помощь онлайн',
  description: 'Первый шаг к эмоциональному балансу. Интерактивные инструменты, консультации, ресурсы.',
};

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <ProblemCards />
      <FirstStepSection />
      <TrustBlocks />
      <FAQSection />
      <CTASection />
    </main>
  );
}
```

### 6.4 Обработка состояний экранов

**Каждый экран должен обрабатывать:**

1. **Loading** — показ скелетонов или спиннеров
2. **Error** — показ ошибки с возможностью повтора
3. **Empty** — показ пустого состояния
4. **Success** — показ данных

**Пример:**

```tsx
// src/app/blog/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/services/api/content';
import { ArticleCard } from '@/components/features/content/ArticleCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';

export default function BlogPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="Статьи скоро появятся" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Блог</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
```

---

## 7) Интеграция с Backend API

### 7.1 API Client Setup

**Создание Axios instance:**

```typescript
// src/services/api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Обработка неавторизованного доступа
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 7.2 API Services

**Пример: Content Service**

```typescript
// src/services/api/content.ts
import { apiClient } from './client';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  category: string;
  tags: string[];
}

export interface ArticlesResponse {
  data: Article[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const contentService = {
  getArticles: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    tag?: string;
    search?: string;
  }): Promise<ArticlesResponse> => {
    const response = await apiClient.get<ArticlesResponse>('/content/articles', {
      params,
    });
    return response.data;
  },

  getArticle: async (slug: string): Promise<Article> => {
    const response = await apiClient.get<Article>(`/content/articles/${slug}`);
    return response.data;
  },
};
```

### 7.3 React Query Integration

**Настройка React Query:**

```typescript
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Использование в компонентах:**

```typescript
// src/hooks/useArticles.ts
import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/api/content';

export function useArticles(params?: Parameters<typeof contentService.getArticles>[0]) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => contentService.getArticles(params),
  });
}
```

### 7.4 Обработка ошибок API

**Типизация ошибок:**

```typescript
// src/lib/types.ts
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiError).error === 'object'
  );
}
```

**Компонент для отображения ошибок:**

```tsx
// src/components/shared/ErrorState.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { isApiError } from '@/lib/types';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = isApiError(error)
    ? error.error.message
    : 'Произошла ошибка. Пожалуйста, попробуйте позже.';

  return (
    <Alert variant="destructive">
      <AlertTitle>Ошибка</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          Попробовать снова
        </Button>
      )}
    </Alert>
  );
}
```

---

## 8) Роутинг и навигация

### 8.1 Next.js App Router

**Структура роутов соответствует `docs/information-architecture.md`**

**Пример: Динамический роут**

```tsx
// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/services/api/content';
import { ArticleContent } from '@/components/features/content/ArticleContent';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const article = await getArticle(params.slug);
    return {
      title: article.title,
      description: article.excerpt,
    };
  } catch {
    return {
      title: 'Статья не найдена',
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  try {
    const article = await getArticle(params.slug);
    return <ArticleContent article={article} />;
  } catch {
    notFound();
  }
}
```

### 8.2 Навигационные компоненты

**Header с навигацией:**

```tsx
// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Эмоциональный баланс
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/topics">С чем я помогаю</Link>
            <Link href="/booking">Запись</Link>
            {isAuthenticated ? (
              <Link href="/cabinet">Личный кабинет</Link>
            ) : (
              <Button asChild>
                <Link href="/login">Войти</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
```

### 8.3 Breadcrumbs

**Компонент breadcrumbs:**

```tsx
// src/components/layout/Breadcrumbs.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ))}
    </nav>
  );
}
```

---

## 9) Управление состоянием

### 9.1 Server State (React Query)

**Используется для:**
- Данные из API
- Кэширование
- Автоматический refetch
- Оптимистичные обновления

**Пример:**

```typescript
// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetService } from '@/services/api/cabinet';

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: cabinetService.getAppointments,
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      cabinetService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
```

### 9.2 Client State (Zustand)

**Используется для:**
- UI состояние (модалки, тема)
- Локальное состояние формы
- Состояние booking flow

**Пример: Auth Store**

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('auth_token', token);
      },
      clearAuth: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth_token');
      },
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 9.3 Form State (React Hook Form + Zod)

**Пример формы с валидацией:**

```tsx
// src/components/features/booking/IntakeForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const intakeSchema = z.object({
  question_1: z.string().min(1, 'Обязательное поле'),
  question_2: z.string().min(1, 'Обязательное поле'),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

export function IntakeForm({ onSubmit }: { onSubmit: (data: IntakeFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="question_1">Вопрос 1</Label>
        <Input
          id="question_1"
          {...register('question_1')}
          aria-invalid={errors.question_1 ? 'true' : 'false'}
          aria-describedby={errors.question_1 ? 'question_1-error' : undefined}
        />
        {errors.question_1 && (
          <p id="question_1-error" className="text-sm text-danger mt-1">
            {errors.question_1.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Отправить'}
      </Button>
    </form>
  );
}
```

---

## 10) Обработка состояний (Loading/Error/Success)

### 10.1 Loading States

**Скелетоны для контента:**

```tsx
// src/components/shared/LoadingSpinner.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

**Spinner для действий:**

```tsx
// src/components/shared/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
}
```

### 10.2 Error States

**Компонент ошибки:**

```tsx
// src/components/shared/ErrorState.tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Ошибка', message, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          Попробовать снова
        </Button>
      )}
    </Alert>
  );
}
```

### 10.3 Empty States

**Компонент пустого состояния:**

```tsx
// src/components/shared/EmptyState.tsx
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = 'Пусто',
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

### 10.4 Success States

**Toast уведомления:**

```tsx
// Использование sonner для toast
import { toast } from 'sonner';

// В компоненте
toast.success('Запись успешно создана!');
toast.error('Ошибка при создании записи');
toast.info('Информация');
```

---

## 11) Аналитика (Tracking Plan Integration)

### 11.1 Tracking Service

**Создание tracking service согласно `docs/Tracking-Plan.md`:**

```typescript
// src/services/tracking/tracker.ts
interface TrackingEvent {
  event_name: string;
  event_version: number;
  event_id: string;
  occurred_at: string;
  source: 'web' | 'backend' | 'telegram' | 'admin';
  environment: 'prod' | 'stage' | 'dev';
  session_id: string;
  anonymous_id: string;
  user_id?: string;
  lead_id?: string;
  page?: {
    page_path: string;
    page_title: string;
    referrer?: string;
  };
  acquisition?: {
    entry_point: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  properties: Record<string, unknown>;
}

class Tracker {
  private anonymousId: string;
  private sessionId: string;

  constructor() {
    this.anonymousId = this.getOrCreateAnonymousId();
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateAnonymousId(): string {
    const stored = localStorage.getItem('anonymous_id');
    if (stored) return stored;
    const newId = `anon_${this.generateId()}`;
    localStorage.setItem('anonymous_id', newId);
    return newId;
  }

  private getOrCreateSessionId(): string {
    const stored = sessionStorage.getItem('session_id');
    if (stored) return stored;
    const newId = this.generateId();
    sessionStorage.setItem('session_id', newId);
    return newId;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(eventName: string, properties: Record<string, unknown> = {}) {
    // Валидация на PII (см. privacy.ts)
    const validatedProperties = this.validatePrivacy(properties);

    const event: TrackingEvent = {
      event_name: eventName,
      event_version: 1,
      event_id: this.generateId(),
      occurred_at: new Date().toISOString(),
      source: 'web',
      environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
      session_id: this.sessionId,
      anonymous_id: this.anonymousId,
      user_id: this.getUserId(),
      lead_id: this.getLeadId(),
      page: this.getPageContext(),
      acquisition: this.getAcquisitionContext(),
      properties: validatedProperties,
    };

    // Отправка события (в аналитику или backend)
    this.sendEvent(event);
  }

  private validatePrivacy(properties: Record<string, unknown>): Record<string, unknown> {
    // Проверка на запрещённые поля (PII, тексты)
    // См. docs/Tracking-Plan.md раздел 8
    const forbiddenFields = ['email', 'phone', 'text', 'content', 'answer'];
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (forbiddenFields.some((field) => key.toLowerCase().includes(field))) {
        console.warn(`[Tracking] Skipping forbidden field: ${key}`);
        continue;
      }
      filtered[key] = value;
    }

    return filtered;
  }

  private getUserId(): string | undefined {
    // Получить из auth store
    return undefined; // TODO: реализовать
  }

  private getLeadId(): string | undefined {
    // Получить из localStorage или создать при первом контакте
    return undefined; // TODO: реализовать
  }

  private getPageContext() {
    if (typeof window === 'undefined') return undefined;
    return {
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || undefined,
    };
  }

  private getAcquisitionContext() {
    // Парсинг UTM из URL или localStorage
    const params = new URLSearchParams(window.location.search);
    return {
      entry_point: this.getEntryPoint(),
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
    };
  }

  private getEntryPoint(): string {
    // Определить точку входа
    if (document.referrer) {
      if (document.referrer.includes('telegram')) return 'telegram';
      if (document.referrer.includes('google')) return 'seo';
      return 'referral';
    }
    return 'direct';
  }

  private sendEvent(event: TrackingEvent) {
    // Отправка в аналитику (например, через backend endpoint)
    // Или напрямую в аналитический сервис
    if (process.env.NODE_ENV === 'development') {
      console.log('[Tracking Event]', event);
    }

    // TODO: Реализовать отправку
    // fetch('/api/tracking', { method: 'POST', body: JSON.stringify(event) });
  }
}

export const tracker = new Tracker();
```

### 11.2 Tracking Hook

**React hook для удобного использования:**

```typescript
// src/hooks/useTracking.ts
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { tracker } from '@/services/tracking/tracker';

export function useTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Автоматический page_view при изменении роута
    tracker.track('page_view', {
      page_path: pathname,
    });
  }, [pathname]);

  return {
    track: (eventName: string, properties?: Record<string, unknown>) => {
      tracker.track(eventName, properties);
    },
  };
}
```

### 11.3 Использование в компонентах

**Пример:**

```tsx
// src/components/features/booking/ServiceSelector.tsx
'use client';

import { useTracking } from '@/hooks/useTracking';

export function ServiceSelector() {
  const { track } = useTracking();

  const handleServiceSelect = (serviceId: string, serviceSlug: string) => {
    track('service_selected', {
      service_id: serviceId,
      service_slug: serviceSlug,
    });
    // ... логика выбора
  };

  return (
    // ... UI
  );
}
```

### 11.4 События из Tracking Plan

**Реализовать все события из `docs/Tracking-Plan.md` раздел 6:**

- `page_view`
- `booking_start`, `booking_slot_selected`, `booking_paid`, `booking_confirmed`
- `start_quiz`, `complete_quiz`, `quiz_abandoned`
- `navigator_start`, `navigator_complete`
- `cta_tg_click`
- И другие...

---

## 12) Accessibility (A11y)

### 12.1 Общие требования

**Соответствие WCAG 2.2 Level AA согласно `docs/Accessibility-A11y-Requirements.md`**

### 12.2 Клавиатурная навигация

**Skip Link:**

```tsx
// src/components/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      Перейти к основному содержимому
    </a>
  );
}
```

**Focus Management:**

```tsx
// src/components/ui/dialog.tsx
// Использовать Radix UI Dialog, который автоматически управляет фокусом
import * as DialogPrimitive from '@radix-ui/react-dialog';

export function Dialog({ children, ...props }) {
  return (
    <DialogPrimitive.Root {...props}>
      {/* Radix автоматически управляет focus trap */}
      {children}
    </DialogPrimitive.Root>
  );
}
```

### 12.3 Семантика и ARIA

**Правильная разметка:**

```tsx
// ✅ Правильно
<main id="main-content">
  <h1>Заголовок страницы</h1>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Заголовок секции</h2>
    <p>Контент</p>
  </section>
</main>

// ❌ Неправильно
<div>
  <div className="text-2xl font-bold">Заголовок</div>
  <div>Контент</div>
</div>
```

### 12.4 Формы и валидация

**Доступные формы:**

```tsx
<Label htmlFor="email">Email</Label>
<Input
  id="email"
  type="email"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-danger" role="alert">
    {errors.email.message}
  </p>
)}
```

### 12.5 Контраст и цвета

**Проверка контраста:**

- Использовать инструменты: WebAIM Contrast Checker, axe DevTools
- Все цвета из Design System уже проверены на контраст
- Не передавать смысл только цветом (добавлять иконки, текст)

### 12.6 Тестирование A11y

**Автоматические проверки:**

```typescript
// tests/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from '@/components/MyComponent';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Ручное тестирование:**

- Навигация только с клавиатуры (Tab, Shift+Tab, Enter, Esc)
- Тестирование со screen reader (NVDA, VoiceOver)
- Проверка контраста

---

## 13) Производительность и оптимизация

### 13.1 Code Splitting

**Next.js автоматически делает code splitting по роутам**

**Ручной code splitting для больших компонентов:**

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Если компонент не нужен на сервере
});
```

### 13.2 Image Optimization

**Использование Next.js Image:**

```tsx
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // Для above-the-fold изображений
  placeholder="blur" // Если есть blurDataURL
/>
```

### 13.3 Font Optimization

**Использование next/font:**

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={inter.className}>
      {children}
    </html>
  );
}
```

### 13.4 Caching

**React Query кэширование:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
    },
  },
});
```

### 13.5 Bundle Analysis

**Анализ размера бандла:**

```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... конфигурация
});
```

---

## 14) Тестирование

### 14.1 Unit Tests

**Пример unit теста:**

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 14.2 Integration Tests

**Пример integration теста:**

```typescript
// tests/integration/booking-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingFlow } from '@/app/booking/page';

describe('Booking Flow', () => {
  it('allows user to select service and slot', async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BookingFlow />
      </QueryClientProvider>
    );

    // Выбор услуги
    const serviceButton = await screen.findByRole('button', { name: /консультация/i });
    serviceButton.click();

    // Выбор слота
    await waitFor(() => {
      expect(screen.getByText(/выберите время/i)).toBeInTheDocument();
    });
  });
});
```

### 14.3 E2E Tests

**Пример E2E теста (Playwright):**

```typescript
// tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test('booking flow', async ({ page }) => {
  await page.goto('/booking');
  
  // Выбор услуги
  await page.click('text=Консультация онлайн');
  
  // Выбор слота
  await page.click('[data-testid="slot-2026-01-27T10:00:00Z"]');
  
  // Заполнение формы
  await page.fill('#question_1', 'Ответ');
  await page.click('button:has-text("Отправить")');
  
  // Проверка редиректа на оплату
  await expect(page).toHaveURL(/\/booking\/payment/);
});
```

### 14.4 Test Coverage

**Цель:** ≥80% покрытие кода тестами

**Настройка:**

```json
// package.json
{
  "scripts": {
    "test:coverage": "vitest --coverage"
  }
}
```

---

## 15) Деплой и CI/CD

### 15.1 Build Configuration

**next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Для Docker
  images: {
    domains: ['api.example.com'], // Разрешённые домены для изображений
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;
```

### 15.2 Environment Variables

**.env.example:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_TRACKING_ENABLED=true
```

### 15.3 CI/CD Pipeline

**GitHub Actions пример:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      # ... деплой на production
```

### 15.4 Docker

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 16) Чеклисты и критерии готовности

### 16.1 Чеклист для каждого экрана

- [ ] Экран реализован согласно Design System
- [ ] Все состояния обработаны (loading/error/empty/success)
- [ ] Роутинг работает корректно
- [ ] API интеграция работает
- [ ] Аналитика интегрирована (если требуется)
- [ ] Accessibility проверки пройдены
- [ ] Responsive дизайн работает (mobile/desktop)
- [ ] Типизация TypeScript корректна
- [ ] Нет console errors/warnings
- [ ] Тесты написаны (если требуется)

### 16.2 Чеклист для Phase 6

#### Design System Integration
- [ ] Все токены импортированы и работают
- [ ] Все UI компоненты интегрированы
- [ ] Все domain компоненты интегрированы
- [ ] Темная тема работает (если поддерживается)

#### Экраны
- [ ] Все P0 экраны реализованы
- [ ] Все P1 экраны реализованы (или отложены с обоснованием)
- [ ] Все экраны соответствуют IA

#### API Integration
- [ ] Все API endpoints интегрированы
- [ ] Обработка ошибок работает
- [ ] Аутентификация работает
- [ ] React Query настроен корректно

#### Роутинг и навигация
- [ ] Все роуты работают
- [ ] Навигация работает
- [ ] Breadcrumbs работают (где требуется)
- [ ] 404 страница работает

#### Аналитика
- [ ] Tracking service реализован
- [ ] Все события из Tracking Plan интегрированы
- [ ] Privacy validation работает
- [ ] События отправляются корректно

#### Accessibility
- [ ] WCAG 2.2 AA соответствие
- [ ] Клавиатурная навигация работает
- [ ] Screen reader тестирование пройдено
- [ ] Контраст проверен

#### Производительность
- [ ] Code splitting работает
- [ ] Images оптимизированы
- [ ] Fonts оптимизированы
- [ ] Bundle size в пределах нормы

#### Тестирование
- [ ] Unit тесты написаны (≥80% покрытие)
- [ ] Integration тесты написаны
- [ ] E2E тесты написаны для критичных флоу
- [ ] Все тесты проходят

#### Деплой
- [ ] CI/CD настроен
- [ ] Production build работает
- [ ] Environment variables настроены
- [ ] Документация обновлена

### 16.3 Definition of Done для Phase 6

Phase 6 считается завершённой, когда:

1. ✅ Все P0 экраны реализованы и работают
2. ✅ Design System полностью интегрирован
3. ✅ Backend API полностью интегрирован
4. ✅ Все роуты работают корректно
5. ✅ Аналитика настроена и работает
6. ✅ Accessibility проверки пройдены (WCAG 2.2 AA)
7. ✅ Производительность соответствует требованиям
8. ✅ Тесты написаны и проходят (≥80% покрытие)
9. ✅ CI/CD настроен и работает
10. ✅ Документация обновлена

---

## 17) Риски и митигация

### 17.1 Риск: Сложность интеграции Design System

**Митигация:**
- Раннее начало интеграции
- Тестирование на простых экранах
- Создание скриптов синхронизации компонентов

### 17.2 Риск: Задержки в API интеграции

**Митигация:**
- Mock данные для разработки
- Раннее начало интеграции
- Тесная координация с backend командой

### 17.3 Риск: Производительность при большом объёме данных

**Митигация:**
- Пагинация везде, где требуется
- Виртуализация списков (react-window)
- Оптимизация запросов (React Query caching)

### 17.4 Риск: Accessibility проблемы

**Митигация:**
- Ранние проверки с axe DevTools
- Тестирование со screen reader на каждом этапе
- Code review с фокусом на A11y

---

## 18) Следующие шаги

После завершения Phase 6:

1. Переход к **Phase 7: Integration & Testing**
2. Интеграционное тестирование frontend + backend
3. E2E тестирование ключевых сценариев
4. Нагрузочное тестирование
5. Security audit
6. A11y финальная проверка

---

## 19) Ссылки на документацию

### Основные документы
- `docs/Development-Phase-Plan.md` — План разработки
- `docs/Design-Handoff.md` — Design Handoff
- `docs/api/api-contracts.md` — API контракты
- `docs/Tracking-Plan.md` — План аналитики
- `docs/Accessibility-A11y-Requirements.md` — Требования доступности
- `docs/information-architecture.md` — Информационная архитектура

### Design System
- `design_system/docs/DEVELOPER_GUIDE.md` — Руководство разработчика
- `design_system/docs/TOKENS.md` — Токены дизайн-системы
- `design_system/SCREENS_STRUCTURE.md` — Структура экранов

### Архитектура
- `docs/Архитектурный-обзор.md` — Архитектурный обзор
- `docs/Domain-Model-Specification.md` — Доменная модель

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Готово к реализации

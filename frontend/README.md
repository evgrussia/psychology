# Frontend — Эмоциональный баланс

Frontend приложение на Next.js 14+ (App Router) для платформы психологической помощи.

## Технологический стек

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI
- **State Management:** Zustand (client state), React Query (server state)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios

## Структура проекта

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/       # Marketing pages
│   │   ├── (content)/         # Content pages
│   │   ├── booking/           # Booking flow
│   │   ├── cabinet/           # Client cabinet
│   │   └── legal/             # Legal pages
│   ├── components/
│   │   ├── ui/                # UI components
│   │   ├── domain/            # Domain components
│   │   ├── layout/            # Layout components
│   │   ├── features/          # Feature components
│   │   └── shared/            # Shared components
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API services
│   ├── store/                 # Zustand stores
│   ├── lib/                   # Utilities
│   └── styles/                # Global styles
├── tests/                     # Tests
└── docs/                      # Documentation
```

## Установка

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev

# Сборка
pnpm build

# Запуск production
pnpm start
```

## Переменные окружения

Создайте `.env.local` на основе `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_TRACKING_ENABLED=true
```

## Разработка

### Добавление нового экрана

1. Создайте файл `src/app/[route]/page.tsx`
2. Добавьте layout если нужен
3. Интегрируйте с API через hooks
4. Добавьте tracking события

### Добавление компонента

1. UI компоненты → `src/components/ui/`
2. Domain компоненты → `src/components/domain/`
3. Feature компоненты → `src/components/features/[feature]/`

## Тестирование

```bash
# Unit тесты
pnpm test

# E2E тесты
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Accessibility

Проект соответствует WCAG 2.2 Level AA. Все компоненты должны:
- Поддерживать клавиатурную навигацию
- Иметь правильные ARIA атрибуты
- Иметь достаточный контраст
- Работать со screen readers

## Лицензия

Proprietary

---
*Документ создан: Coder Agent*

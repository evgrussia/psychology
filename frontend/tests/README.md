# Frontend Tests

Этот документ описывает структуру тестов для frontend приложения Phase 6.

## Структура тестов

```
tests/
├── setup.ts                    # Глобальная настройка тестов
├── __mocks__/                  # Моки для зависимостей
│   └── axios.ts
├── unit/                       # Unit тесты
│   ├── components/            # Тесты компонентов
│   │   ├── ui/                # UI компоненты
│   │   ├── shared/            # Shared компоненты
│   │   └── domain/            # Domain компоненты
│   ├── hooks/                 # Тесты hooks
│   ├── services/              # Тесты services
│   └── store/                 # Тесты stores
├── integration/               # Integration тесты
│   └── api/                   # API integration тесты
├── e2e/                       # E2E тесты (Playwright)
│   ├── booking.spec.ts
│   └── auth.spec.ts
└── a11y/                       # Accessibility тесты
    └── button.test.tsx
```

## Запуск тестов

### Unit тесты
```bash
npm run test
```

### С покрытием
```bash
npm run test:coverage
```

### E2E тесты
```bash
npm run test:e2e
```

## Покрытие

Целевое покрытие: **≥80%**

- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Типы тестов

### Unit Tests
Тестируют отдельные компоненты, hooks, services и stores в изоляции.

**Примеры:**
- Компоненты: рендеринг, пропсы, события
- Hooks: логика, состояние, side effects
- Services: API вызовы, обработка данных
- Stores: управление состоянием

### Integration Tests
Тестируют взаимодействие между модулями, особенно API services.

**Примеры:**
- API services с мокированным HTTP клиентом
- Взаимодействие компонентов с hooks
- Интеграция stores с services

### E2E Tests
Тестируют полные пользовательские сценарии через браузер.

**Примеры:**
- Booking flow (выбор услуги → слот → форма → оплата)
- Authentication flow (регистрация → вход → выход)
- Navigation между страницами

### Accessibility Tests
Тестируют доступность компонентов согласно WCAG 2.2 AA.

**Примеры:**
- Проверка ARIA атрибутов
- Клавиатурная навигация
- Контрастность цветов

## Настройка

### Vitest
Конфигурация: `vitest.config.ts`

- Environment: jsdom (для React компонентов)
- Setup: `tests/setup.ts`
- Coverage: v8 provider

### Playwright
Конфигурация: `playwright.config.ts`

- Браузеры: Chromium, Firefox, WebKit
- Base URL: `http://localhost:3000`
- Автоматический запуск dev server

## Моки

### Next.js Router
Мокируется через `next/navigation` в `setup.ts`

### Axios
Мокируется в `tests/__mocks__/axios.ts`

### LocalStorage/SessionStorage
Мокируется в `setup.ts`

## Best Practices

1. **Изоляция**: Каждый тест должен быть независимым
2. **Чистота**: Очистка состояния между тестами
3. **Моки**: Использовать моки для внешних зависимостей
4. **Покрытие**: Стремиться к ≥80% покрытию
5. **Читаемость**: Понятные названия тестов и описания
6. **ARRANGE-ACT-ASSERT**: Следовать паттерну AAA

## Примеры

### Unit Test (Component)
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

it('renders correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Integration Test (API)
```typescript
import { contentService } from '@/services/api/content';

it('fetches articles', async () => {
  const result = await contentService.getArticles();
  expect(result.data).toBeDefined();
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('booking flow', async ({ page }) => {
  await page.goto('/booking');
  // ... тест сценария
});
```

---
*Документ создан: QA Agent*

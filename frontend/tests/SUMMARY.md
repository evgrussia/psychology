# Тесты для Phase 6 - Frontend Integration

## Обзор

Создан полный набор тестов для frontend приложения Phase 6 согласно спецификации.

## Структура тестов

### Конфигурация
- ✅ `vitest.config.ts` - конфигурация Vitest с coverage
- ✅ `playwright.config.ts` - конфигурация Playwright для E2E
- ✅ `tests/setup.ts` - глобальная настройка тестов

### Unit Tests (70% от общего покрытия)

#### Компоненты UI
- ✅ `button.test.tsx` - тесты Button компонента
- ✅ `card.test.tsx` - тесты Card компонентов
- ✅ `input.test.tsx` - тесты Input компонента

#### Shared Components
- ✅ `LoadingSpinner.test.tsx` - тесты LoadingSpinner и ArticleCardSkeleton
- ✅ `ErrorState.test.tsx` - тесты ErrorState компонента
- ✅ `EmptyState.test.tsx` - тесты EmptyState компонента

#### Hooks
- ✅ `useAuth.test.tsx` - тесты useAuth hook
- ✅ `useTracking.test.ts` - тесты useTracking hook
- ✅ `useDebounce.test.ts` - тесты useDebounce hook
- ✅ `useLocalStorage.test.ts` - тесты useLocalStorage hook

#### Services
- ✅ `api/client.test.ts` - тесты API client (interceptors, error handling)
- ✅ `tracking/tracker.test.ts` - тесты Tracking service

#### Stores
- ✅ `authStore.test.ts` - тесты Auth store
- ✅ `bookingStore.test.ts` - тесты Booking store
- ✅ `uiStore.test.ts` - тесты UI store

### Integration Tests (20% от общего покрытия)

#### API Services
- ✅ `api/content.test.ts` - интеграционные тесты Content service
- ✅ `api/booking.test.ts` - интеграционные тесты Booking service

### E2E Tests (10% от общего покрытия)

#### Критичные флоу
- ✅ `booking.spec.ts` - E2E тесты booking flow
- ✅ `auth.spec.ts` - E2E тесты authentication flow

### Accessibility Tests

- ✅ `a11y/button.test.tsx` - A11y тесты для Button компонента

## Покрытие

Целевое покрытие: **≥80%**

- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Запуск тестов

```bash
# Unit тесты
npm run test

# С покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e
```

## CI/CD

Настроен GitHub Actions workflow (`.github/workflows/tests.yml`):
- Unit тесты с coverage
- E2E тесты с Playwright
- Автоматический запуск на push/PR

## Моки

- ✅ Next.js Router (`next/navigation`)
- ✅ Axios (`tests/__mocks__/axios.ts`)
- ✅ LocalStorage/SessionStorage
- ✅ Window.matchMedia

## Следующие шаги

1. Запустить тесты и исправить возможные ошибки
2. Дополнить тесты для недостающих компонентов
3. Расширить E2E тесты для полных пользовательских сценариев
4. Добавить больше A11y тестов
5. Настроить автоматическую отправку coverage в Codecov

---
*Документ создан: QA Agent*

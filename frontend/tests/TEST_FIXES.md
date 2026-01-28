# Исправления тестов Phase 6

## Проблемы и решения

### 1. Конфигурация Vitest
**Проблема:** Ошибка ESM модулей при использовании `.ts` конфига  
**Решение:** Переименован `vitest.config.ts` в `vitest.config.mjs` для поддержки ESM

### 2. Test Environment
**Проблема:** jsdom требует Node.js 20+, установлен Node.js 18  
**Решение:** Заменен jsdom на happy-dom, который поддерживает Node.js 18

### 3. E2E тесты в Vitest
**Проблема:** E2E тесты (Playwright) запускались через Vitest  
**Решение:** Добавлено исключение `**/e2e/**` в конфигурацию Vitest

### 4. Booking Service Tests
**Проблема:** Неправильные ожидания - service возвращает массив, а не объект с data  
**Решение:** Исправлены ожидания: `expect(result).toEqual(mockResponse.data.data)`

### 5. Tracking Service Tests
**Проблема:** console.log не вызывается в тестовом окружении (NODE_ENV !== 'development')  
**Решение:** Установка `process.env.NODE_ENV = 'development'` перед тестами и восстановление после

### 6. useDebounce Tests
**Проблема:** Таймауты тестов из-за неправильного использования fake timers  
**Решение:** 
- Заменен `vi.restoreAllMocks()` на `vi.useRealTimers()` в afterEach
- Использован `vi.runAllTimersAsync()` вместо `waitFor` для асинхронных обновлений

### 7. API Client Tests
**Проблема:** apiClient не мокировался правильно  
**Решение:** Удален мок axios, тесты работают с реальным apiClient и его interceptors

## Результаты

✅ **Все тесты проходят:**
- Test Files: 18 passed
- Tests: 97 passed
- Duration: ~8s

## Предупреждения

⚠️ Есть предупреждения об `act()` в useDebounce тестах - это не критично, но можно улучшить, обернув обновления в `act()`

---
*Документ создан: Coder Agent*

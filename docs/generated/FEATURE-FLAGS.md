# Feature Flags Documentation

## Обзор

Проект использует простую систему feature flags для управления релизами функциональности.

## Доступные флаги

| Флаг | Описание | Dev | Stage | Prod |
|------|----------|-----|-------|------|
| `homepage_v1_enabled` | Главная страница v1 | ✅ | ✅ | ✅ |
| `telegram_integration_enabled` | Интеграция с Telegram | ✅ | ✅ | ✅ |
| `interactive_quiz_enabled` | Интерактивные квизы | ✅ | ✅ | ✅ |
| `booking_flow_enabled` | Флоу записи на консультацию | ✅ | ✅ | ✅ |
| `diary_feature_enabled` | Дневники эмоций | ✅ | ❌ | ❌ |
| `trust_pages_v1_enabled` | Страницы доверия (/about, /how-it-works) | ✅ | ✅ | ✅ |

## Использование

### В React компонентах

```typescript
import { useFeatureFlag } from '@/lib/feature-flags';

function MyComponent() {
  const isDiaryEnabled = useFeatureFlag('diary_feature_enabled');
  
  if (!isDiaryEnabled) {
    return <div>Функция еще не доступна</div>;
  }
  
  return <DiaryComponent />;
}
```

### В серверных компонентах / API

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function GET(request: Request) {
  if (!isFeatureEnabled('booking_flow_enabled')) {
    return new Response('Feature not available', { status: 404 });
  }
  
  // ... handle request
}
```

### Проверка флага

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';

if (isFeatureEnabled('homepage_v1_enabled')) {
  // Показываем новую главную
} else {
  // Показываем старую главную
}
```

## Переопределение через переменные окружения

Флаги можно переопределить через environment variables в production:

```bash
# .env.production
NEXT_PUBLIC_FF_HOMEPAGE_V1=true
NEXT_PUBLIC_FF_TELEGRAM=true
NEXT_PUBLIC_FF_QUIZ=true
NEXT_PUBLIC_FF_BOOKING=true
NEXT_PUBLIC_FF_DIARY=false
NEXT_PUBLIC_FF_TRUST_PAGES=true
```

## Тестирование

В тестах можно переопределять флаги:

```typescript
import { 
  __TEST_ONLY_setFeatureFlags, 
  __TEST_ONLY_resetFeatureFlags 
} from '@/lib/feature-flags';

describe('My Component', () => {
  beforeEach(() => {
    __TEST_ONLY_setFeatureFlags({
      homepage_v1_enabled: true,
    });
  });
  
  afterEach(() => {
    __TEST_ONLY_resetFeatureFlags();
  });
  
  it('renders when feature is enabled', () => {
    // test
  });
});
```

## Архитектура

### Текущее решение (Релиз 1)

- Простая система на основе конфигурации в коде
- Флаги загружаются при старте приложения
- Переопределение через environment variables
- Не требует внешних сервисов

### Будущее развитие (Релиз 2+)

Для более продвинутого управления feature flags рекомендуется:

**Опции:**
1. **LaunchDarkly** - enterprise решение с targeting, A/B тестами
2. **Unleash** - open-source, self-hosted
3. **PostHog** - feature flags + аналитика
4. **Custom solution** - расширение текущей системы с admin UI

**Критерии выбора:**
- Нужен ли targeting по пользователям?
- Нужны ли A/B тесты?
- Бюджет на SaaS решения
- Требования к self-hosting

## Миграция на внешний сервис

При необходимости миграции на LaunchDarkly/Unleash:

1. Установить SDK
2. Заменить `loadFeatureFlags()` на вызов SDK
3. Оставить интерфейс `isFeatureEnabled()` без изменений
4. Компоненты не требуют изменений

Пример с LaunchDarkly:

```typescript
import * as LDClient from 'launchdarkly-js-client-sdk';

let ldClient: LDClient.LDClient;

async function initFeatureFlags() {
  ldClient = LDClient.initialize('client-side-id', {
    anonymous: true,
  });
  
  await ldClient.waitForInitialization();
}

export function isFeatureEnabled(flag: string): boolean {
  return ldClient.variation(flag, false);
}
```

## Best Practices

1. **Именование:** используйте `feature_name_enabled` паттерн
2. **Дефолты:** дефолтное значение должно быть `false` (выключено)
3. **Удаление:** удаляйте флаги после полного раскатывания фичи
4. **Документация:** обновляйте таблицу флагов при добавлении новых
5. **Тестирование:** тестируйте оба состояния флага (on/off)

## Решение для FEAT-WEB-01

Согласно техспеке FEAT-WEB-01, требовался feature flag `homepage_v1_enabled`.

**Реализация:** ✅ Добавлен флаг `homepage_v1_enabled`

**Статус по окружениям:**
- Development: ✅ Включен (для разработки)
- Stage: ✅ Включен (для тестирования)
- Production: ✅ Включен (главная страница в production)

**Обоснование:**
- Для релиза 1 достаточно простой системы feature flags
- Флаг включен во всех окружениях (главная готова)
- При необходимости можно отключить через env variable
- Готовность к миграции на внешний сервис в будущем

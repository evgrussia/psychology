/**
 * Feature Flags Service
 * 
 * Простая система feature flags для релиза 1.
 * В будущем может быть заменена на LaunchDarkly, Unleash, или другие решения.
 */

export interface FeatureFlags {
  homepage_v1_enabled: boolean;
  homepage_conversion_v2_enabled: boolean;
  telegram_integration_enabled: boolean;
  interactive_quiz_enabled: boolean;
  booking_flow_enabled: boolean;
  diary_feature_enabled: boolean;
  trust_pages_v1_enabled: boolean;
  topic_landings_enabled: boolean;
}

// Дефолтные значения feature flags для разных окружений
const defaultFlags: Record<string, FeatureFlags> = {
  development: {
    homepage_v1_enabled: true,
    homepage_conversion_v2_enabled: true,
    telegram_integration_enabled: true,
    interactive_quiz_enabled: true,
    booking_flow_enabled: true,
    diary_feature_enabled: true,
    trust_pages_v1_enabled: true,
    topic_landings_enabled: true,
  },
  stage: {
    homepage_v1_enabled: true,
    homepage_conversion_v2_enabled: true,
    telegram_integration_enabled: true,
    interactive_quiz_enabled: true,
    booking_flow_enabled: true,
    diary_feature_enabled: false, // Еще не готово на stage
    trust_pages_v1_enabled: true, // Trust pages включены на stage
    topic_landings_enabled: true, // Topic landings включены на stage
  },
  production: {
    homepage_v1_enabled: true, // Главная страница включена в production
    homepage_conversion_v2_enabled: true,
    telegram_integration_enabled: true,
    interactive_quiz_enabled: true,
    booking_flow_enabled: true,
    diary_feature_enabled: false, // Дневники еще не в production
    trust_pages_v1_enabled: true, // Trust pages включены в production
    topic_landings_enabled: true, // Topic landings включены в production
  },
};

/**
 * Получает текущее окружение
 */
function getEnvironment(): string {
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  return 'development';
}

/**
 * Загружает feature flags из переменных окружения или использует дефолтные
 */
function loadFeatureFlags(): FeatureFlags {
  const env = getEnvironment();
  const defaults = defaultFlags[env] || defaultFlags.development;

  // Если в production, можно переопределить через env variables
  if (typeof process !== 'undefined' && process.env) {
    return {
      homepage_v1_enabled:
        process.env.NEXT_PUBLIC_FF_HOMEPAGE_V1 === 'true' ||
        defaults.homepage_v1_enabled,
      homepage_conversion_v2_enabled:
        process.env.NEXT_PUBLIC_FF_HOMEPAGE_CONVERSION_V2 === 'true' ||
        defaults.homepage_conversion_v2_enabled,
      telegram_integration_enabled:
        process.env.NEXT_PUBLIC_FF_TELEGRAM === 'true' ||
        defaults.telegram_integration_enabled,
      interactive_quiz_enabled:
        process.env.NEXT_PUBLIC_FF_QUIZ === 'true' ||
        defaults.interactive_quiz_enabled,
      booking_flow_enabled:
        process.env.NEXT_PUBLIC_FF_BOOKING === 'true' ||
        defaults.booking_flow_enabled,
      diary_feature_enabled:
        process.env.NEXT_PUBLIC_FF_DIARY === 'true' ||
        defaults.diary_feature_enabled,
      trust_pages_v1_enabled:
        process.env.NEXT_PUBLIC_FF_TRUST_PAGES === 'true' ||
        defaults.trust_pages_v1_enabled,
      topic_landings_enabled:
        process.env.NEXT_PUBLIC_FF_TOPIC_LANDINGS === 'true' ||
        defaults.topic_landings_enabled,
    };
  }

  return defaults;
}

// Singleton instance
let featureFlagsInstance: FeatureFlags | null = null;

/**
 * Получает feature flags (singleton)
 */
export function getFeatureFlags(): FeatureFlags {
  if (!featureFlagsInstance) {
    featureFlagsInstance = loadFeatureFlags();
  }
  return featureFlagsInstance;
}

/**
 * Проверяет, включен ли feature flag
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag] === true;
}

/**
 * React Hook для использования feature flags
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return isFeatureEnabled(flag);
}

/**
 * Обновляет feature flags (только для тестов)
 */
export function __TEST_ONLY_setFeatureFlags(flags: Partial<FeatureFlags>): void {
  if (getEnvironment() !== 'test') {
    console.warn('setFeatureFlags should only be used in tests');
    return;
  }
  featureFlagsInstance = {
    ...getFeatureFlags(),
    ...flags,
  };
}

/**
 * Сбрасывает feature flags (только для тестов)
 */
export function __TEST_ONLY_resetFeatureFlags(): void {
  featureFlagsInstance = null;
}

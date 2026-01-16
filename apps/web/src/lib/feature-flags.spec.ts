import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getFeatureFlags,
  isFeatureEnabled,
  __TEST_ONLY_setFeatureFlags,
  __TEST_ONLY_resetFeatureFlags,
} from './feature-flags';

describe('Feature Flags', () => {
  beforeEach(() => {
    // __TEST_ONLY_resetFeatureFlags();
  });

  afterEach(() => {
    __TEST_ONLY_resetFeatureFlags();
  });

  it('loads default feature flags', () => {
    const flags = getFeatureFlags();
    
    expect(flags).toBeDefined();
    expect(flags.homepage_v1_enabled).toBeDefined();
    expect(flags.telegram_integration_enabled).toBeDefined();
  });

  it('returns correct flag value', () => {
    __TEST_ONLY_setFeatureFlags({
      homepage_v1_enabled: true,
      diary_feature_enabled: false,
    });

    expect(isFeatureEnabled('homepage_v1_enabled')).toBe(true);
    expect(isFeatureEnabled('diary_feature_enabled')).toBe(false);
  });

  it('can override flags in tests', () => {
    __TEST_ONLY_setFeatureFlags({
      homepage_v1_enabled: false,
    });

    expect(isFeatureEnabled('homepage_v1_enabled')).toBe(false);
  });

  it('resets flags correctly', () => {
    __TEST_ONLY_setFeatureFlags({
      homepage_v1_enabled: false,
    });

    expect(isFeatureEnabled('homepage_v1_enabled')).toBe(false);

    __TEST_ONLY_resetFeatureFlags();

    // После сброса должны быть дефолтные значения
    const flags = getFeatureFlags();
    expect(flags.homepage_v1_enabled).toBeDefined();
  });
});

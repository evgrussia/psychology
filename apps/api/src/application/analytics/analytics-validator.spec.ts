import { validateAnalyticsPayload } from './analytics-validator';

describe('AnalyticsValidator', () => {
  it('blocks forbidden keys', () => {
    const result = validateAnalyticsPayload('booking_start', 'web', {
      email: 'test@example.com',
      service_slug: 'primary_consultation',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('properties:email'))).toBe(true);
  });

  it('blocks PII-like values', () => {
    const result = validateAnalyticsPayload('booking_start', 'web', {
      service_slug: 'primary_consultation',
      freeform: 'test@example.com',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('properties:freeform'))).toBe(true);
  });
});

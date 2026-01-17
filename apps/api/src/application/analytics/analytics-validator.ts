import { ANALYTICS_ALLOWED_EVENTS, ANALYTICS_ALLOWED_SOURCES } from './analytics-dictionary';

const FORBIDDEN_KEYS = [
  'email',
  'phone',
  'name',
  'first_name',
  'last_name',
  'address',
  'tg_id',
  'telegram_id',
  'passport',
  'inn',
  'text',
  'message',
  'content',
  'body',
  'payload',
  'diary_text',
  'answer',
  'question_text',
  'intake_text',
  'note',
];

const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s\-().]{8,}\d)/;

export interface AnalyticsValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateAnalyticsPayload(
  eventName: string,
  source: string,
  properties: Record<string, unknown> | null | undefined,
): AnalyticsValidationResult {
  const errors: string[] = [];

  if (!ANALYTICS_ALLOWED_EVENTS.includes(eventName)) {
    errors.push(`event_name:${eventName}`);
  }

  if (!ANALYTICS_ALLOWED_SOURCES.includes(source as any)) {
    errors.push(`source:${source}`);
  }

  const violations = validateProperties(properties ?? {});
  if (violations.length > 0) {
    errors.push(...violations.map((item) => `properties:${item}`));
  }

  return { valid: errors.length === 0, errors };
}

function validateProperties(properties: Record<string, unknown>): string[] {
  const violations: string[] = [];

  const checkValue = (value: unknown, path: string, key?: string): void => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const lowerKey = key?.toLowerCase() || '';
      
      // Skip PII pattern checks for known safe system keys like IDs, slugs, and timestamps
      const isSafeKey = 
        lowerKey.endsWith('_id') || 
        lowerKey.endsWith('_slug') || 
        lowerKey.endsWith('_at') ||
        lowerKey.endsWith('_at_utc') ||
        lowerKey === 'id' ||
        lowerKey === 'slug' ||
        lowerKey === 'token' ||
        lowerKey === 'key';

      if (!isSafeKey) {
        if (EMAIL_PATTERN.test(trimmed)) {
          violations.push(`${path}:email`);
        }
        if (PHONE_PATTERN.test(trimmed)) {
          violations.push(`${path}:phone`);
        }
      }

      if (trimmed.length > 400) {
        violations.push(`${path}:text_length`);
      }
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => checkValue(item, `${path}[${index}]`));
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      checkObject(value as Record<string, unknown>, path);
    }
  };

  const checkObject = (obj: Record<string, unknown>, prefix: string): void => {
    Object.entries(obj).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_KEYS.includes(lowerKey)) {
        violations.push(`${path}:forbidden_key`);
      }
      checkValue(value, path, key);
    });
  };

  checkObject(properties, '');
  return violations;
}

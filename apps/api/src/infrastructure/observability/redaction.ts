const SENSITIVE_KEYS = [
  'password',
  'pass',
  'token',
  'access_token',
  'refresh_token',
  'encrypted',
  'cipher',
  'ciphertext',
  'id_token',
  'secret',
  'authorization',
  'cookie',
  'set-cookie',
  'email',
  'phone',
  'card',
  'card_number',
  'cvv',
  'cvc',
  'iban',
  'account',
  'address',
  'name',
  'first_name',
  'last_name',
  'surname',
  'birth',
  'dob',
  'passport',
  'inn',
  'snils',
  'tg_id',
  'telegram_id',
  'message_text',
  'text',
  'content',
  'notes',
  'payload',
  'diary',
  'answers',
  'question',
];

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /\b\+?\d[\d\s().-]{7,}\d\b/g;
const BEARER_REGEX = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g;
const CIPHERTEXT_REGEX = /\b[^:\s]{1,64}:[A-Za-z0-9+/=]{8,}:[A-Za-z0-9+/=]{8,}:[A-Za-z0-9+/=]{8,}\b/g;

const REDACTED_VALUE = '[REDACTED]';

const shouldRedactKey = (key: string): boolean => {
  const lowered = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowered.includes(sensitive));
};

const redactString = (value: string): string => {
  return value
    .replace(CIPHERTEXT_REGEX, '[REDACTED_CIPHERTEXT]')
    .replace(EMAIL_REGEX, '[REDACTED_EMAIL]')
    .replace(PHONE_REGEX, '[REDACTED_PHONE]')
    .replace(BEARER_REGEX, 'Bearer [REDACTED_TOKEN]');
};

export const redactSensitiveData = (value: unknown): unknown => {
  const visited = new WeakSet<object>();

  const redact = (input: unknown): unknown => {
    if (typeof input === 'string') {
      return redactString(input);
    }
    if (typeof input !== 'object' || input === null) {
      return input;
    }
    if (input instanceof Date) {
      return input.toISOString();
    }
    if (input instanceof Error) {
      return {
        name: input.name,
        message: redactString(input.message),
        stack: input.stack ? redactString(input.stack) : undefined,
      };
    }
    if (visited.has(input)) {
      return '[Circular]';
    }
    visited.add(input);

    if (Array.isArray(input)) {
      return input.map((item) => redact(item));
    }

    const output: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(input)) {
      if (shouldRedactKey(key)) {
        output[key] = REDACTED_VALUE;
      } else {
        output[key] = redact(rawValue);
      }
    }
    return output;
  };

  return redact(value);
};

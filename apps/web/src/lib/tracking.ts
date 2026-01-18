/**
 * Tracking Service
 * 
 * Единая точка отправки событий аналитики согласно Tracking Plan
 */
import { ANALYTICS_ALLOWED_EVENTS } from './analytics-events';

export interface TrackProperties {
  [key: string]: any;
}

// Список запрещённых полей (PII и чувствительные данные)
const FORBIDDEN_FIELDS = [
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

// Генерация стабильного anonymous_id
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let anonymousId = localStorage.getItem('anonymous_id');
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_id', anonymousId);
  }
  return anonymousId;
}

// Генерация session_id (30 минут неактивности = новая сессия)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 минут
  const now = Date.now();
  
  const sessionData = localStorage.getItem('session_data');
  if (sessionData) {
    const { sessionId, lastActivity } = JSON.parse(sessionData);
    if (now - lastActivity < SESSION_TIMEOUT) {
      // Обновляем время последней активности
      localStorage.setItem('session_data', JSON.stringify({ sessionId, lastActivity: now }));
      return sessionId;
    }
  }
  
  // Создаём новую сессию
  const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('session_data', JSON.stringify({ sessionId: newSessionId, lastActivity: now }));
  return newSessionId;
}

// Генерация event_id
function generateEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Валидация на запрещённые поля (PII)
function validateProperties(properties: TrackProperties): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  function checkValue(value: any, currentPath: string): void {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (EMAIL_PATTERN.test(trimmed)) {
        violations.push(`${currentPath}:email`);
      }
      if (PHONE_PATTERN.test(trimmed)) {
        violations.push(`${currentPath}:phone`);
      }
      if (trimmed.length > 400) {
        violations.push(`${currentPath}:text_length`);
      }
    }
  }

  function checkObject(obj: any, path: string = ''): void {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const lowerKey = key.toLowerCase();
      
      // Проверяем, является ли ключ запрещённым (точное совпадение)
      if (FORBIDDEN_FIELDS.includes(lowerKey)) {
        violations.push(currentPath);
      }
      
      checkValue(obj[key], currentPath);
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => checkValue(item, `${currentPath}[${index}]`));
      }

      // Рекурсивно проверяем вложенные объекты
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        checkObject(obj[key], currentPath);
      }
    }
  }
  
  checkObject(properties);
  
  return {
    valid: violations.length === 0,
    violations,
  };
}

function getStoredLeadId(): string | null {
  if (typeof window === 'undefined') return null;
  const value = localStorage.getItem('lead_id');
  return value && value.trim().length > 0 ? value : null;
}

function setStoredLeadId(leadId: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  if (leadId && leadId.trim().length > 0) {
    localStorage.setItem('lead_id', leadId);
  }
}

function getEnvironment(): 'prod' | 'stage' | 'dev' {
  if (process.env.NODE_ENV === 'production') {
    return 'prod';
  }
  if (process.env.NODE_ENV === 'test') {
    return 'stage';
  }
  return 'dev';
}

function getAcquisitionParams(): Record<string, any> {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('utm_params') : null;
  const parsed = stored ? safeJsonParse(stored) : null;
  return {
    entry_point: typeof window !== 'undefined' ? localStorage.getItem('entry_point') || 'direct' : 'direct',
    ...(parsed || {}),
  };
}

function safeJsonParse(raw: string): Record<string, any> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function sendToIngest(payload: Record<string, any>): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  const url = `${apiUrl}/analytics/ingest`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json().catch(() => null);
    if (data?.lead_id) {
      setStoredLeadId(data.lead_id);
    }
  } catch (error) {
    console.error('[Tracking] Failed to send event:', error);
  }
}

export const track = (eventName: string, properties: TrackProperties = {}) => {
  if (typeof window === 'undefined') {
    console.log('[Tracking] Skipping server-side tracking');
    return;
  }

  if (!ANALYTICS_ALLOWED_EVENTS.has(eventName)) {
    console.warn(`[Tracking] BLOCKED: Event "${eventName}" is not in the tracking dictionary.`);
    return;
  }
  
  // Валидация на PII
  const validation = validateProperties(properties);
  if (!validation.valid) {
    console.error(
      `[Tracking] BLOCKED: Event "${eventName}" contains forbidden fields (PII):`,
      validation.violations
    );
    return;
  }
  
  const payload = {
    schema_version: '1.0',
    event_name: eventName,
    event_version: 1,
    event_id: generateEventId(),
    occurred_at: new Date().toISOString(),
    source: 'web',
    environment: getEnvironment(),
    session_id: getSessionId(),
    anonymous_id: getAnonymousId(),
    lead_id: getStoredLeadId(),
    // user_id будет добавлен после авторизации
    // lead_id будет добавлен после первого контактного события
    page: {
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
    },
    acquisition: getAcquisitionParams(),
    properties,
  };

  // If window.track is defined (e.g. by E2E tests), call it to allow interception
  if (typeof window !== 'undefined' && (window as any).track && (window as any).track !== track) {
    (window as any).track(eventName, properties);
  }

  console.log(`[Tracking] ${eventName}:`, payload);

  void sendToIngest(payload);
};

// Утилита для трекинга UTM параметров при первом визите
export function captureUTMParameters() {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
  };
  
  // Сохраняем только если есть хотя бы один UTM параметр
  if (Object.values(utmParams).some(v => v !== null)) {
    localStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
  
  // Определяем entry_point
  if (utmParams.utm_source) {
    if (utmParams.utm_source === 'telegram') {
      localStorage.setItem('entry_point', 'telegram');
    } else if (utmParams.utm_medium === 'cpc' || utmParams.utm_medium === 'paid') {
      localStorage.setItem('entry_point', 'ads');
    } else {
      localStorage.setItem('entry_point', 'referral');
    }
  } else if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    if (document.referrer.includes('google') || document.referrer.includes('yandex')) {
      localStorage.setItem('entry_point', 'seo');
    } else {
      localStorage.setItem('entry_point', 'referral');
    }
  } else if (!localStorage.getItem('entry_point')) {
    localStorage.setItem('entry_point', 'direct');
  }
}

export function getLeadId(): string | null {
  return getStoredLeadId();
}

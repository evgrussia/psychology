/**
 * Tracking Service
 * 
 * Единая точка отправки событий аналитики согласно Tracking Plan
 */

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
  'diary_text',
  'answer',
  'question_text',
  'intake_text',
];

// Генерация стабильного anonymous_id
function getAnonymousId(): string {
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
  
  let sessionData = localStorage.getItem('session_data');
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
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Валидация на запрещённые поля (PII)
function validateProperties(properties: TrackProperties): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  function checkObject(obj: any, path: string = ''): void {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      const lowerKey = key.toLowerCase();
      
      // Проверяем, содержит ли ключ запрещённые слова
      if (FORBIDDEN_FIELDS.some(forbidden => lowerKey.includes(forbidden))) {
        violations.push(currentPath);
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

export const track = (eventName: string, properties: TrackProperties = {}) => {
  if (typeof window === 'undefined') {
    console.log('[Tracking] Skipping server-side tracking');
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
    environment: process.env.NODE_ENV || 'development',
    session_id: getSessionId(),
    anonymous_id: getAnonymousId(),
    // user_id будет добавлен после авторизации
    // lead_id будет добавлен после первого контактного события
    page: {
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
    },
    acquisition: {
      // UTM параметры будут извлечены из URL при первом визите
      entry_point: localStorage.getItem('entry_point') || 'direct',
    },
    properties,
  };

  // If window.track is defined (e.g. by E2E tests), call it to allow interception
  if (typeof window !== 'undefined' && (window as any).track && (window as any).track !== track) {
    (window as any).track(eventName, properties);
  }

  console.log(`[Tracking] ${eventName}:`, payload);
  
  // In production this will send events to the backend
  if (process.env.NODE_ENV === 'production') {
    // Backend endpoint for tracking will be implemented in a future feature
    /*
    fetch('/api/tracking', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    }).catch(err => console.error('[Tracking] Failed to send event:', err));
    */
  }
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

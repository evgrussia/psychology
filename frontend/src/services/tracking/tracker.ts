import { isBrowser } from '@/lib/utils';

interface TrackingEvent {
  event_name: string;
  event_version: number;
  event_id: string;
  occurred_at: string;
  source: 'web' | 'backend' | 'telegram' | 'admin';
  environment: 'prod' | 'stage' | 'dev';
  session_id: string;
  anonymous_id: string;
  user_id?: string;
  lead_id?: string;
  page?: {
    page_path: string;
    page_title: string;
    referrer?: string;
  };
  acquisition?: {
    entry_point: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  properties: Record<string, unknown>;
}

class Tracker {
  private anonymousId: string;
  private sessionId: string;

  constructor() {
    this.anonymousId = this.getOrCreateAnonymousId();
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateAnonymousId(): string {
    if (!isBrowser()) return '';
    const stored = localStorage.getItem('anonymous_id');
    if (stored) return stored;
    const newId = `anon_${this.generateId()}`;
    localStorage.setItem('anonymous_id', newId);
    return newId;
  }

  private getOrCreateSessionId(): string {
    if (!isBrowser()) return '';
    const stored = sessionStorage.getItem('session_id');
    if (stored) return stored;
    const newId = this.generateId();
    sessionStorage.setItem('session_id', newId);
    return newId;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(eventName: string, properties: Record<string, unknown> = {}) {
    // Валидация на PII
    const validatedProperties = this.validatePrivacy(properties);

    const event: TrackingEvent = {
      event_name: eventName,
      event_version: 1,
      event_id: this.generateId(),
      occurred_at: new Date().toISOString(),
      source: 'web',
      environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
      session_id: this.sessionId,
      anonymous_id: this.anonymousId,
      user_id: this.getUserId(),
      lead_id: this.getLeadId(),
      page: this.getPageContext(),
      acquisition: this.getAcquisitionContext(),
      properties: validatedProperties,
    };

    // Отправка события
    this.sendEvent(event);
  }

  private validatePrivacy(properties: Record<string, unknown>): Record<string, unknown> {
    // Проверка на запрещённые поля (PII, тексты)
    const forbiddenFields = ['email', 'phone', 'text', 'content', 'answer'];
    const filtered: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (forbiddenFields.some((field) => key.toLowerCase().includes(field))) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[Tracking] Skipping forbidden field: ${key}`);
        }
        continue;
      }
      filtered[key] = value;
    }

    return filtered;
  }

  private getUserId(): string | undefined {
    // Получить из auth store
    if (!isBrowser()) return undefined;
    // TODO: реализовать получение из auth store
    return undefined;
  }

  private getLeadId(): string | undefined {
    // Получить из localStorage или создать при первом контакте
    if (!isBrowser()) return undefined;
    const stored = localStorage.getItem('lead_id');
    if (stored) return stored;
    const newId = `lead_${this.generateId()}`;
    localStorage.setItem('lead_id', newId);
    return newId;
  }

  private getPageContext() {
    if (!isBrowser()) return undefined;
    return {
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || undefined,
    };
  }

  private getAcquisitionContext() {
    if (!isBrowser()) return undefined;
    const params = new URLSearchParams(window.location.search);
    return {
      entry_point: this.getEntryPoint(),
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
    };
  }

  private getEntryPoint(): string {
    if (!isBrowser()) return 'direct';
    if (document.referrer) {
      if (document.referrer.includes('telegram')) return 'telegram';
      if (document.referrer.includes('google')) return 'seo';
      return 'referral';
    }
    return 'direct';
  }

  private async sendEvent(event: TrackingEvent) {
    // Отправка в аналитику (например, через backend endpoint)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Tracking Event]', event);
    }

    // Отправка в backend, если включено
    if (
      isBrowser() &&
      process.env.NEXT_PUBLIC_TRACKING_ENABLED === 'true'
    ) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        await fetch(`${apiUrl}/tracking/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });
      } catch (error) {
        // Не блокируем выполнение при ошибке отправки
        console.error('[Tracking] Failed to send event:', error);
      }
    }
  }
}

export const tracker = new Tracker();

/**
 * Tracking API: отправка событий аналитики.
 * По плану: frontend/docs/BACKEND-INTEGRATION-PLAN.md § 3.10
 */

import { request } from '@/api/client';
import type { TrackingEventPayload, TrackEventOptions } from '@/api/types/tracking';

const TRACKING_SESSION_KEY = 'eb_session_id';
const TRACKING_ANONYMOUS_KEY = 'eb_anonymous_id';
const SOURCE = 'web';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(TRACKING_SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? generateId();
      localStorage.setItem(TRACKING_SESSION_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

function getOrCreateAnonymousId(): string {
  try {
    let id = localStorage.getItem(TRACKING_ANONYMOUS_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? generateId();
      localStorage.setItem(TRACKING_ANONYMOUS_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

/**
 * Отправляет событие аналитики на бэкенд.
 * Не бросает исключения — ошибки логируются в консоль.
 */
export async function trackEvent(
  eventName: string,
  options: TrackEventOptions = {}
): Promise<void> {
  const eventId = crypto.randomUUID?.() ?? generateId();
  const payload: TrackingEventPayload = {
    event_name: eventName,
    event_id: eventId,
    occurred_at: new Date().toISOString(),
    source: SOURCE,
    session_id: getOrCreateSessionId(),
    anonymous_id: getOrCreateAnonymousId(),
    ...(options.user_id != null && { user_id: options.user_id }),
    ...(options.page != null && { page: options.page }),
    ...(options.properties != null && Object.keys(options.properties).length > 0 && { properties: options.properties }),
  };

  try {
    await request<{ status: string }>(
      'POST',
      'tracking/events',
      payload,
      { skipRefresh: true }
    );
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[Tracking]', eventName, err);
    }
  }
}

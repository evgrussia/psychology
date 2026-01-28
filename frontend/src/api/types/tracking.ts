/**
 * Типы для Tracking API.
 * По плану: frontend/docs/BACKEND-INTEGRATION-PLAN.md § 3.10
 * Бэкенд: backend/presentation/api/v1/views/tracking.py
 */

export interface TrackingEventPayload {
  event_name: string;
  event_id: string;
  occurred_at: string; // ISO 8601
  source: string;
  session_id: string;
  anonymous_id: string;
  user_id?: string | null;
  page?: string | null;
  properties?: Record<string, unknown>;
}

export interface TrackEventOptions {
  page?: string;
  properties?: Record<string, unknown>;
  user_id?: string | null;
}

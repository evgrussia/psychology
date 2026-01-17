export interface AnalyticsEventInput {
  schemaVersion: string;
  eventName: string;
  eventVersion: number;
  eventId: string;
  occurredAt: Date;
  source: string;
  environment: string;
  sessionId?: string | null;
  anonymousId?: string | null;
  userId?: string | null;
  leadId?: string | null;
  page?: Record<string, unknown> | null;
  acquisition?: Record<string, unknown> | null;
  properties?: Record<string, unknown> | null;
}

export interface IAnalyticsEventRepository {
  create(event: AnalyticsEventInput): Promise<void>;
  existsByEventId(eventId: string): Promise<boolean>;
}

import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';

export interface GoogleCalendarConnectStartResponseDto {
  authorizationUrl: string;
  state: string;
}

export interface GoogleCalendarConnectCallbackDto {
  code: string;
  state: string;
}

export interface GoogleCalendarStatusResponseDto {
  status: GoogleCalendarIntegrationStatus;
  calendarId: string | null;
  timezone: string | null;
  scopes: string[];
  tokenExpiresAt: Date | null;
  connectedAt: Date | null;
}

export interface GoogleCalendarSyncResultDto {
  status: 'success' | 'failed';
  syncedFrom: Date;
  syncedTo: Date;
  busyCount: number;
  lastSyncAt: Date;
  errorMessage?: string | null;
}

export interface GoogleCalendarEventCreationResultDto {
  status: 'created' | 'skipped' | 'failed';
  appointmentId: string;
  eventId?: string | null;
  reason?: string | null;
}

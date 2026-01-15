import { Injectable } from '@nestjs/common';
import { AppLogger } from '../logging/logger.service';
import { HttpClientConfig } from '../config/http-client.config';
import {
  GoogleCalendarBusyInterval,
  GoogleCalendarEventInput,
  GoogleCalendarEventResult,
  GoogleCalendarPrimaryCalendar,
  IGoogleCalendarService,
} from '@domain/integrations/services/IGoogleCalendarService';

const GOOGLE_CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3';

@Injectable()
export class GoogleCalendarService implements IGoogleCalendarService {
  private readonly logger = new AppLogger('GoogleCalendarService');

  constructor(private readonly httpConfig: HttpClientConfig) {}

  async getPrimaryCalendar(accessToken: string): Promise<GoogleCalendarPrimaryCalendar | null> {
    const url = `${GOOGLE_CALENDAR_BASE_URL}/users/me/calendarList?minAccessRole=owner`;
    const data = await this.requestWithRetry(url, {
      method: 'GET',
      headers: this.buildHeaders(accessToken),
    });

    const items = Array.isArray(data?.items) ? data.items : [];
    const primary = items.find((item: any) => item.primary) || items[0];
    if (!primary) {
      return null;
    }

    return {
      id: primary.id,
      timeZone: primary.timeZone || 'UTC',
    };
  }

  async listBusyIntervals(
    accessToken: string,
    calendarId: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<GoogleCalendarBusyInterval[]> {
    const url = `${GOOGLE_CALENDAR_BASE_URL}/freeBusy`;
    const body = {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    };

    const data = await this.requestWithRetry(url, {
      method: 'POST',
      headers: {
        ...this.buildHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const calendars = data?.calendars || {};
    const calendarPayload = calendars[calendarId] || Object.values(calendars)[0];
    const busy = Array.isArray((calendarPayload as any)?.busy) ? (calendarPayload as any).busy : [];

    return busy
      .map((interval: any) => ({
        start: new Date(interval.start),
        end: new Date(interval.end),
      }))
      .filter((interval: GoogleCalendarBusyInterval) => !Number.isNaN(interval.start.getTime()) && !Number.isNaN(interval.end.getTime()));
  }

  async createEvent(
    accessToken: string,
    calendarId: string,
    input: GoogleCalendarEventInput,
  ): Promise<GoogleCalendarEventResult> {
    const url = `${GOOGLE_CALENDAR_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`;
    const payload = {
      summary: input.summary,
      description: input.description,
      start: {
        dateTime: input.startAt.toISOString(),
        timeZone: input.timeZone,
      },
      end: {
        dateTime: input.endAt.toISOString(),
        timeZone: input.timeZone,
      },
    };

    const data = await this.requestWithRetry(url, {
      method: 'POST',
      headers: {
        ...this.buildHeaders(accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!data?.id) {
      throw new Error('Google Calendar event creation failed: missing event id');
    }

    return {
      id: data.id,
      htmlLink: data.htmlLink || null,
    };
  }

  private buildHeaders(accessToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  private async requestWithRetry(url: string, options: RequestInit): Promise<any> {
    const maxAttempts = this.httpConfig.getRetryAttempts();
    let attempt = 0;

    while (attempt <= maxAttempts) {
      const controller = new AbortController();
      const timeoutMs = this.httpConfig.getServiceTimeout('google_calendar');
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        if (response.ok) {
          return await response.json();
        }

        const retryable = response.status === 429 || response.status >= 500;
        const errorPayload = await response.text();
        this.logger.warn({
          message: 'Google Calendar API request failed',
          status: response.status,
          retryable,
          attempt,
        });

        if (!retryable || attempt >= maxAttempts) {
          throw new Error(`Google Calendar API error: ${errorPayload}`);
        }
      } catch (error: any) {
        const shouldRetry = attempt < maxAttempts;
        this.logger.warn({
          message: 'Google Calendar API request error',
          reason: error?.message || 'unknown_error',
          attempt,
          retrying: shouldRetry,
        });

        if (!shouldRetry) {
          throw error;
        }
      } finally {
        clearTimeout(timeout);
      }

      await this.sleep(200 * Math.pow(2, attempt));
      attempt += 1;
    }

    throw new Error('Google Calendar API request failed after retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

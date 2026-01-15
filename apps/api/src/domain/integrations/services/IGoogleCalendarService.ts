export interface GoogleCalendarBusyInterval {
  start: Date;
  end: Date;
}

export interface GoogleCalendarEventInput {
  summary: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  timeZone: string;
}

export interface GoogleCalendarEventResult {
  id: string;
  htmlLink?: string | null;
}

export interface GoogleCalendarPrimaryCalendar {
  id: string;
  timeZone: string;
}

export interface IGoogleCalendarService {
  getPrimaryCalendar(accessToken: string): Promise<GoogleCalendarPrimaryCalendar | null>;
  listBusyIntervals(
    accessToken: string,
    calendarId: string,
    timeMin: Date,
    timeMax: Date,
  ): Promise<GoogleCalendarBusyInterval[]>;
  createEvent(
    accessToken: string,
    calendarId: string,
    input: GoogleCalendarEventInput,
  ): Promise<GoogleCalendarEventResult>;
}

export interface ICalendarService {
  createEvent(data: any): Promise<string>;
}

export class GoogleCalendarStub implements ICalendarService {
  async createEvent(data: any): Promise<string> {
    console.log('Mock: Creating Google Calendar event', data);
    return 'mock-event-id';
  }
}

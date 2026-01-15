import { GoogleCalendarIntegration } from '../entities/GoogleCalendarIntegration';

export interface IGoogleCalendarIntegrationRepository {
  findLatest(): Promise<GoogleCalendarIntegration | null>;
  findByOAuthState(state: string): Promise<GoogleCalendarIntegration | null>;
  save(integration: GoogleCalendarIntegration): Promise<void>;
}

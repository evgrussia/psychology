import { Inject, Injectable } from '@nestjs/common';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { GoogleCalendarStatusResponseDto } from '../dto/google-calendar.dto';

@Injectable()
export class GetGoogleCalendarStatusUseCase {
  constructor(
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepo: IGoogleCalendarIntegrationRepository,
  ) {}

  async execute(): Promise<GoogleCalendarStatusResponseDto> {
    const integration = await this.integrationRepo.findLatest();

    if (!integration) {
      return {
        status: GoogleCalendarIntegrationStatus.disconnected,
        calendarId: null,
        timezone: null,
        scopes: [],
        tokenExpiresAt: null,
        connectedAt: null,
      };
    }

    return {
      status: integration.status,
      calendarId: integration.calendarId || null,
      timezone: integration.timezone || null,
      scopes: integration.scopes || [],
      tokenExpiresAt: integration.tokenExpiresAt || null,
      connectedAt: integration.connectedAt || null,
    };
  }
}

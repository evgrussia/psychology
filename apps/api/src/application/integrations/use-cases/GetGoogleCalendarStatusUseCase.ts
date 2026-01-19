import { Inject, Injectable } from '@nestjs/common';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { GoogleCalendarStatusResponseDto } from '../dto/google-calendar.dto';
import { ISystemSettingsRepository } from '@domain/settings/repositories/ISystemSettingsRepository';

@Injectable()
export class GetGoogleCalendarStatusUseCase {
  constructor(
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepo: IGoogleCalendarIntegrationRepository,
    @Inject('ISystemSettingsRepository')
    private readonly settingsRepository: ISystemSettingsRepository,
  ) {}

  async execute(): Promise<GoogleCalendarStatusResponseDto> {
    const integration = await this.integrationRepo.findLatest();
    const settings = await this.settingsRepository.get();
    const syncMode = settings?.googleCalendarSyncMode ?? 'auto';

    if (!integration) {
      return {
        status: GoogleCalendarIntegrationStatus.disconnected,
        calendarId: null,
        timezone: null,
        scopes: [],
        tokenExpiresAt: null,
        connectedAt: null,
        syncMode,
      };
    }

    return {
      status: integration.status,
      calendarId: integration.calendarId || null,
      timezone: integration.timezone || null,
      scopes: integration.scopes || [],
      tokenExpiresAt: integration.tokenExpiresAt || null,
      connectedAt: integration.connectedAt || null,
      syncMode,
    };
  }
}

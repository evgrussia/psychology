import { Inject, Injectable } from '@nestjs/common';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';

@Injectable()
export class DisconnectGoogleCalendarUseCase {
  constructor(
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepo: IGoogleCalendarIntegrationRepository,
  ) {}

  async execute() {
    const integration = await this.integrationRepo.findLatest();
    if (!integration) {
      return {
        status: GoogleCalendarIntegrationStatus.disconnected,
      };
    }

    integration.update({
      status: GoogleCalendarIntegrationStatus.disconnected,
      calendarId: null,
      timezone: null,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiresAt: null,
      scopes: [],
      oauthState: null,
      oauthStateExpiresAt: null,
      connectedByUserId: null,
      connectedAt: null,
      lastSyncAt: null,
      lastSyncError: null,
      lastSyncRangeStartAt: null,
      lastSyncRangeEndAt: null,
    });

    await this.integrationRepo.save(integration);

    return {
      status: integration.status,
    };
  }
}

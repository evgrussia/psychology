import { Inject, Injectable } from '@nestjs/common';
import { GoogleCalendarIntegration } from '@domain/integrations/entities/GoogleCalendarIntegration';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { IGoogleCalendarOAuthService } from '@domain/integrations/services/IGoogleCalendarOAuthService';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';

const TOKEN_EXPIRY_SAFETY_MS = 60 * 1000;

@Injectable()
export class GoogleCalendarTokenService {
  constructor(
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepo: IGoogleCalendarIntegrationRepository,
    @Inject('IGoogleCalendarOAuthService')
    private readonly oauthService: IGoogleCalendarOAuthService,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async getValidAccessToken(integration: GoogleCalendarIntegration): Promise<string> {
    if (!integration.encryptedRefreshToken) {
      throw new Error('Google Calendar refresh token is missing');
    }

    const expiresAt = integration.tokenExpiresAt?.getTime() || 0;
    const isExpired = !integration.encryptedAccessToken || expiresAt <= Date.now() + TOKEN_EXPIRY_SAFETY_MS;

    if (isExpired) {
      return this.refreshAccessToken(integration);
    }

    return this.encryptionService.decrypt(integration.encryptedAccessToken);
  }

  private async refreshAccessToken(integration: GoogleCalendarIntegration): Promise<string> {
    const refreshToken = this.encryptionService.decrypt(integration.encryptedRefreshToken!);
    const response = await this.oauthService.refreshAccessToken(refreshToken);
    const encryptedAccessToken = this.encryptionService.encrypt(response.accessToken);
    const expiresAt = new Date(Date.now() + response.expiresIn * 1000);
    const scopes = response.scope ? response.scope.split(' ').filter(Boolean) : integration.scopes;

    integration.update({
      encryptedAccessToken,
      tokenExpiresAt: expiresAt,
      scopes,
    });

    await this.integrationRepo.save(integration);
    return response.accessToken;
  }
}

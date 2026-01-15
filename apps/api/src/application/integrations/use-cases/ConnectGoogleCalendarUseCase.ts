import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GoogleCalendarIntegration } from '@domain/integrations/entities/GoogleCalendarIntegration';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { IGoogleCalendarOAuthService } from '@domain/integrations/services/IGoogleCalendarOAuthService';
import { IGoogleCalendarService } from '@domain/integrations/services/IGoogleCalendarService';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { GoogleCalendarConnectStartResponseDto, GoogleCalendarStatusResponseDto } from '../dto/google-calendar.dto';
import { AuditLogHelper } from '../../audit/helpers/audit-log.helper';
import { AuditLogAction } from '../../audit/dto/audit-log.dto';

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class ConnectGoogleCalendarUseCase {
  private readonly logger = new Logger(ConnectGoogleCalendarUseCase.name);

  constructor(
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepo: IGoogleCalendarIntegrationRepository,
    @Inject('IGoogleCalendarOAuthService')
    private readonly oauthService: IGoogleCalendarOAuthService,
    @Inject('IGoogleCalendarService')
    private readonly googleCalendarService: IGoogleCalendarService,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async startConnection(
    actorUserId: string,
    actorRole: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<GoogleCalendarConnectStartResponseDto> {
    const state = randomUUID();
    const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS);
    const existing = await this.integrationRepo.findLatest();
    const authUrl = this.oauthService.buildAuthorizationUrl(state);

    const integration = existing
      ? existing.update({
          status: GoogleCalendarIntegrationStatus.pending,
          oauthState: state,
          oauthStateExpiresAt: expiresAt,
          connectedByUserId: actorUserId,
        })
      : GoogleCalendarIntegration.create({
          id: randomUUID(),
          status: GoogleCalendarIntegrationStatus.pending,
          calendarId: null,
          timezone: null,
          encryptedAccessToken: null,
          encryptedRefreshToken: null,
          tokenExpiresAt: null,
          scopes: [],
          oauthState: state,
          oauthStateExpiresAt: expiresAt,
          connectedByUserId: actorUserId,
          connectedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

    await this.integrationRepo.save(integration);

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      AuditLogAction.ADMIN_GOOGLE_CALENDAR_CONNECT_STARTED,
      'GoogleCalendarIntegration',
      integration.id,
      null,
      {
        status: GoogleCalendarIntegrationStatus.pending,
        oauthStateExpiresAt: expiresAt.toISOString(),
      },
      ipAddress,
      userAgent,
    );

    this.logger.log({
      message: 'Google Calendar OAuth start initiated',
      status: GoogleCalendarIntegrationStatus.pending,
    });

    return {
      authorizationUrl: authUrl,
      state,
    };
  }

  async completeConnection(
    code: string,
    state: string,
    actorUserId: string,
    actorRole: string,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<GoogleCalendarStatusResponseDto> {
    const integration = await this.integrationRepo.findByOAuthState(state);
    if (!integration || !integration.oauthStateExpiresAt) {
      throw new BadRequestException('Invalid OAuth state');
    }

    if (integration.oauthStateExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OAuth state expired');
    }

    try {
      const tokenResponse = await this.oauthService.exchangeCodeForTokens(code);
      const encryptedAccessToken = this.encryptionService.encrypt(tokenResponse.accessToken);
      const encryptedRefreshToken = tokenResponse.refreshToken
        ? this.encryptionService.encrypt(tokenResponse.refreshToken)
        : integration.encryptedRefreshToken;

      if (!encryptedRefreshToken) {
        throw new BadRequestException('Missing refresh token from Google OAuth');
      }

      const expiresAt = new Date(Date.now() + tokenResponse.expiresIn * 1000);
      const scopes = tokenResponse.scope ? tokenResponse.scope.split(' ').filter(Boolean) : [];

      let calendarId = integration.calendarId;
      let timezone = integration.timezone;
      try {
        const primary = await this.googleCalendarService.getPrimaryCalendar(tokenResponse.accessToken);
        if (primary) {
          calendarId = primary.id;
          timezone = primary.timeZone;
        }
      } catch (calendarError) {
        this.logger.warn({
          message: 'Failed to fetch primary Google Calendar metadata',
          reason: (calendarError as Error)?.message || 'unknown_error',
        });
      }

      integration.update({
        status: GoogleCalendarIntegrationStatus.connected,
        calendarId,
        timezone,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
        scopes,
        oauthState: null,
        oauthStateExpiresAt: null,
        connectedByUserId: actorUserId,
        connectedAt: integration.connectedAt || new Date(),
      });

      await this.integrationRepo.save(integration);

      await this.auditLogHelper.logAction(
        actorUserId,
        actorRole,
        AuditLogAction.ADMIN_GOOGLE_CALENDAR_CONNECTED,
        'GoogleCalendarIntegration',
        integration.id,
        null,
        {
          status: GoogleCalendarIntegrationStatus.connected,
          tokenExpiresAt: expiresAt.toISOString(),
          scopeCount: scopes.length,
        },
        ipAddress,
        userAgent,
      );

      this.logger.log({
        message: 'Google Calendar OAuth completed',
        status: GoogleCalendarIntegrationStatus.connected,
      });

      return this.toStatusDto(integration);
    } catch (error) {
      integration.update({
        status: GoogleCalendarIntegrationStatus.error,
        oauthState: null,
        oauthStateExpiresAt: null,
      });
      await this.integrationRepo.save(integration);

      this.logger.error(
        { message: 'Google Calendar OAuth failed', reason: error?.message || 'unknown_error' },
        error?.stack,
      );

      throw error;
    }
  }

  private toStatusDto(integration: GoogleCalendarIntegration): GoogleCalendarStatusResponseDto {
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

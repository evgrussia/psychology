import { GoogleCalendarIntegration as PrismaGoogleCalendarIntegration, GoogleCalendarIntegrationStatus as PrismaStatus } from '@prisma/client';
import { GoogleCalendarIntegration } from '@domain/integrations/entities/GoogleCalendarIntegration';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';

export class GoogleCalendarIntegrationMapper {
  static toDomain(prismaIntegration: PrismaGoogleCalendarIntegration): GoogleCalendarIntegration {
    return GoogleCalendarIntegration.create({
      id: prismaIntegration.id,
      status: this.mapStatusToDomain(prismaIntegration.status),
      calendarId: prismaIntegration.calendar_id,
      timezone: prismaIntegration.timezone,
      encryptedAccessToken: prismaIntegration.encrypted_access_token,
      encryptedRefreshToken: prismaIntegration.encrypted_refresh_token,
      tokenExpiresAt: prismaIntegration.token_expires_at,
      scopes: prismaIntegration.scopes || [],
      oauthState: prismaIntegration.oauth_state,
      oauthStateExpiresAt: prismaIntegration.oauth_state_expires_at,
      connectedByUserId: prismaIntegration.connected_by_user_id,
      connectedAt: prismaIntegration.connected_at,
      lastSyncAt: prismaIntegration.last_sync_at,
      lastSyncError: prismaIntegration.last_sync_error,
      lastSyncRangeStartAt: prismaIntegration.last_sync_range_start_at,
      lastSyncRangeEndAt: prismaIntegration.last_sync_range_end_at,
      createdAt: prismaIntegration.created_at,
      updatedAt: prismaIntegration.updated_at,
    });
  }

  static toPrisma(domainIntegration: GoogleCalendarIntegration): PrismaGoogleCalendarIntegration {
    return {
      id: domainIntegration.id,
      status: this.mapStatusToPrisma(domainIntegration.status),
      calendar_id: domainIntegration.calendarId,
      timezone: domainIntegration.timezone,
      encrypted_access_token: domainIntegration.encryptedAccessToken,
      encrypted_refresh_token: domainIntegration.encryptedRefreshToken,
      token_expires_at: domainIntegration.tokenExpiresAt,
      scopes: domainIntegration.scopes || [],
      oauth_state: domainIntegration.oauthState,
      oauth_state_expires_at: domainIntegration.oauthStateExpiresAt,
      connected_by_user_id: domainIntegration.connectedByUserId,
      connected_at: domainIntegration.connectedAt,
      last_sync_at: domainIntegration.lastSyncAt,
      last_sync_error: domainIntegration.lastSyncError,
      last_sync_range_start_at: domainIntegration.lastSyncRangeStartAt,
      last_sync_range_end_at: domainIntegration.lastSyncRangeEndAt,
      created_at: domainIntegration.createdAt,
      updated_at: domainIntegration.updatedAt,
    };
  }

  private static mapStatusToDomain(status: PrismaStatus): GoogleCalendarIntegrationStatus {
    switch (status) {
      case PrismaStatus.disconnected:
        return GoogleCalendarIntegrationStatus.disconnected;
      case PrismaStatus.pending:
        return GoogleCalendarIntegrationStatus.pending;
      case PrismaStatus.connected:
        return GoogleCalendarIntegrationStatus.connected;
      case PrismaStatus.error:
        return GoogleCalendarIntegrationStatus.error;
      default:
        throw new Error(`Unknown GoogleCalendarIntegrationStatus: ${status}`);
    }
  }

  private static mapStatusToPrisma(status: GoogleCalendarIntegrationStatus): PrismaStatus {
    switch (status) {
      case GoogleCalendarIntegrationStatus.disconnected:
        return PrismaStatus.disconnected;
      case GoogleCalendarIntegrationStatus.pending:
        return PrismaStatus.pending;
      case GoogleCalendarIntegrationStatus.connected:
        return PrismaStatus.connected;
      case GoogleCalendarIntegrationStatus.error:
        return PrismaStatus.error;
      default:
        throw new Error(`Unknown GoogleCalendarIntegrationStatus: ${status}`);
    }
  }
}

import { ConnectGoogleCalendarUseCase } from './ConnectGoogleCalendarUseCase';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { IGoogleCalendarOAuthService } from '@domain/integrations/services/IGoogleCalendarOAuthService';
import { IGoogleCalendarService } from '@domain/integrations/services/IGoogleCalendarService';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { GoogleCalendarIntegration } from '@domain/integrations/entities/GoogleCalendarIntegration';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { ISystemSettingsRepository } from '@domain/settings/repositories/ISystemSettingsRepository';

describe('ConnectGoogleCalendarUseCase', () => {
  let useCase: ConnectGoogleCalendarUseCase;
  let integrationRepo: jest.Mocked<IGoogleCalendarIntegrationRepository>;
  let oauthService: jest.Mocked<IGoogleCalendarOAuthService>;
  let googleCalendarService: jest.Mocked<IGoogleCalendarService>;
  let encryptionService: jest.Mocked<IEncryptionService>;
  let settingsRepo: jest.Mocked<ISystemSettingsRepository>;
  const auditLogHelper = { logAction: jest.fn() };

  beforeEach(() => {
    integrationRepo = {
      findLatest: jest.fn(),
      findByOAuthState: jest.fn(),
      save: jest.fn(),
    };
    oauthService = {
      buildAuthorizationUrl: jest.fn(),
      exchangeCodeForTokens: jest.fn(),
      refreshAccessToken: jest.fn(),
    };
    googleCalendarService = {
      getPrimaryCalendar: jest.fn(),
      listBusyIntervals: jest.fn(),
      createEvent: jest.fn(),
    };
    encryptionService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };
    settingsRepo = {
      get: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new ConnectGoogleCalendarUseCase(
      integrationRepo,
      oauthService,
      googleCalendarService,
      encryptionService,
      settingsRepo,
      auditLogHelper as any,
    );
  });

  it('should start OAuth connection and persist pending state', async () => {
    integrationRepo.findLatest.mockResolvedValue(null);
    oauthService.buildAuthorizationUrl.mockReturnValue('https://oauth.test/authorize');

    const result = await useCase.startConnection('user-1', 'owner');

    expect(result.authorizationUrl).toBe('https://oauth.test/authorize');
    expect(result.state).toBeTruthy();
    expect(integrationRepo.save).toHaveBeenCalledTimes(1);
    const savedIntegration = (integrationRepo.save.mock.calls[0][0] as GoogleCalendarIntegration);
    expect(savedIntegration.status).toBe(GoogleCalendarIntegrationStatus.pending);
    expect(savedIntegration.oauthState).toBe(result.state);
  });

  it('should complete OAuth connection and store encrypted tokens', async () => {
    const integration = GoogleCalendarIntegration.create({
      id: 'integration-1',
      status: GoogleCalendarIntegrationStatus.pending,
      calendarId: null,
      timezone: null,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      tokenExpiresAt: null,
      scopes: [],
      oauthState: 'state-1',
      oauthStateExpiresAt: new Date(Date.now() + 60000),
      connectedByUserId: null,
      connectedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    integrationRepo.findByOAuthState.mockResolvedValue(integration);
    oauthService.exchangeCodeForTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      scope: 'scope-1 scope-2',
      expiresIn: 3600,
      tokenType: 'Bearer',
    });
    googleCalendarService.getPrimaryCalendar.mockResolvedValue({
      id: 'primary',
      timeZone: 'Europe/Moscow',
    });
    encryptionService.encrypt.mockImplementation((value) => `enc:${value}`);

    const status = await useCase.completeConnection('code-1', 'state-1', 'user-1', 'owner');

    expect(status.status).toBe(GoogleCalendarIntegrationStatus.connected);
    expect(encryptionService.encrypt).toHaveBeenCalledWith('access-token');
    expect(encryptionService.encrypt).toHaveBeenCalledWith('refresh-token');
    expect(integrationRepo.save).toHaveBeenCalledTimes(1);
  });
});

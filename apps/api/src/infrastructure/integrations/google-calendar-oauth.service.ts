import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGoogleCalendarOAuthService, GoogleOAuthTokenResponse } from '@domain/integrations/services/IGoogleCalendarOAuthService';
import { HttpClientConfig } from '../config/http-client.config';
import { AppLogger } from '../logging/logger.service';

const GOOGLE_OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

@Injectable()
export class GoogleCalendarOAuthService implements IGoogleCalendarOAuthService {
  private readonly logger = new AppLogger('GoogleCalendarOAuthService');
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpConfig: HttpClientConfig,
  ) {
    this.clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('GOOGLE_OAUTH_REDIRECT_URI');
    const scopes = this.configService.get<string>('GOOGLE_OAUTH_SCOPES');
    this.scopes = scopes
      ? scopes.split(' ').filter(Boolean)
      : ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Google OAuth configuration is missing');
    }
  }

  buildAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    });

    return `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokenResponse> {
    const controller = new AbortController();
    const timeoutMs = this.httpConfig.getServiceTimeout('google_oauth');
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const body = new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      });

      const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.text();
        this.logger.error({ message: 'Google OAuth token exchange failed', status: response.status });
        throw new Error(`Google OAuth token exchange failed: ${payload}`);
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope || '',
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokenResponse> {
    const controller = new AbortController();
    const timeoutMs = this.httpConfig.getServiceTimeout('google_oauth');
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const body = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
      });

      const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.text();
        this.logger.error({ message: 'Google OAuth refresh failed', status: response.status });
        throw new Error(`Google OAuth refresh failed: ${payload}`);
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope || '',
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

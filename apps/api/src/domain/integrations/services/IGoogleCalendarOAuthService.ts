export interface GoogleOAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  scope: string;
  expiresIn: number;
  tokenType: string;
}

export interface IGoogleCalendarOAuthService {
  buildAuthorizationUrl(state: string): string;
  exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokenResponse>;
  refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokenResponse>;
}

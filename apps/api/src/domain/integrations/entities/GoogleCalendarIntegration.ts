import { GoogleCalendarIntegrationStatus } from '../value-objects/GoogleCalendarIntegrationStatus';

export interface GoogleCalendarIntegrationProps {
  id: string;
  status: GoogleCalendarIntegrationStatus;
  calendarId?: string | null;
  timezone?: string | null;
  encryptedAccessToken?: string | null;
  encryptedRefreshToken?: string | null;
  tokenExpiresAt?: Date | null;
  scopes: string[];
  oauthState?: string | null;
  oauthStateExpiresAt?: Date | null;
  connectedByUserId?: string | null;
  connectedAt?: Date | null;
  lastSyncAt?: Date | null;
  lastSyncError?: string | null;
  lastSyncRangeStartAt?: Date | null;
  lastSyncRangeEndAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class GoogleCalendarIntegration {
  constructor(private readonly props: GoogleCalendarIntegrationProps) {}

  get id(): string { return this.props.id; }
  get status(): GoogleCalendarIntegrationStatus { return this.props.status; }
  get calendarId(): string | null | undefined { return this.props.calendarId; }
  get timezone(): string | null | undefined { return this.props.timezone; }
  get encryptedAccessToken(): string | null | undefined { return this.props.encryptedAccessToken; }
  get encryptedRefreshToken(): string | null | undefined { return this.props.encryptedRefreshToken; }
  get tokenExpiresAt(): Date | null | undefined { return this.props.tokenExpiresAt; }
  get scopes(): string[] { return this.props.scopes; }
  get oauthState(): string | null | undefined { return this.props.oauthState; }
  get oauthStateExpiresAt(): Date | null | undefined { return this.props.oauthStateExpiresAt; }
  get connectedByUserId(): string | null | undefined { return this.props.connectedByUserId; }
  get connectedAt(): Date | null | undefined { return this.props.connectedAt; }
  get lastSyncAt(): Date | null | undefined { return this.props.lastSyncAt; }
  get lastSyncError(): string | null | undefined { return this.props.lastSyncError; }
  get lastSyncRangeStartAt(): Date | null | undefined { return this.props.lastSyncRangeStartAt; }
  get lastSyncRangeEndAt(): Date | null | undefined { return this.props.lastSyncRangeEndAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: GoogleCalendarIntegrationProps): GoogleCalendarIntegration {
    return new GoogleCalendarIntegration(props);
  }

  update(updates: Partial<Omit<GoogleCalendarIntegrationProps, 'id' | 'createdAt' | 'updatedAt'>>): GoogleCalendarIntegration {
    Object.assign(this.props, {
      ...updates,
      updatedAt: new Date(),
    });
    return this;
  }
}

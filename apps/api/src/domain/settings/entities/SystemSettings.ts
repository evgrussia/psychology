export interface SystemSettingsProps {
  id: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  googleCalendarSyncMode: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SystemSettings {
  constructor(private readonly props: SystemSettingsProps) {}

  get id(): string { return this.props.id; }
  get maintenanceMode(): boolean { return this.props.maintenanceMode; }
  get registrationEnabled(): boolean { return this.props.registrationEnabled; }
  get googleCalendarSyncMode(): string { return this.props.googleCalendarSyncMode; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: SystemSettingsProps): SystemSettings {
    return new SystemSettings(props);
  }
}

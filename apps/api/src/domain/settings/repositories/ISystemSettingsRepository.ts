import { SystemSettings } from '../entities/SystemSettings';

export interface ISystemSettingsRepository {
  get(): Promise<SystemSettings | null>;
  upsert(data: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  }): Promise<SystemSettings>;
}

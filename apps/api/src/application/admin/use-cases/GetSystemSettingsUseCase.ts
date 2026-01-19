import { Inject, Injectable } from '@nestjs/common';
import { ISystemSettingsRepository } from '@domain/settings/repositories/ISystemSettingsRepository';

@Injectable()
export class GetSystemSettingsUseCase {
  constructor(
    @Inject('ISystemSettingsRepository')
    private readonly settingsRepository: ISystemSettingsRepository,
  ) {}

  async execute() {
    const settings = await this.settingsRepository.get();

    return {
      maintenanceMode: settings?.maintenanceMode ?? false,
      registrationEnabled: settings?.registrationEnabled ?? true,
      googleCalendarSyncMode: settings?.googleCalendarSyncMode ?? 'auto',
    };
  }
}

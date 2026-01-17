import { Inject, Injectable } from '@nestjs/common';
import { IScheduleSettingsRepository } from '@domain/booking/repositories/IScheduleSettingsRepository';
import { ScheduleSettingsDto } from '../../dto/schedule.dto';

@Injectable()
export class GetScheduleSettingsUseCase {
  constructor(
    @Inject('IScheduleSettingsRepository')
    private readonly scheduleSettingsRepository: IScheduleSettingsRepository,
  ) {}

  async execute(): Promise<ScheduleSettingsDto> {
    const settings = await this.scheduleSettingsRepository.get();
    if (!settings) {
      const created = await this.scheduleSettingsRepository.upsert({
        timezone: 'UTC',
        bufferMinutes: 0,
      });
      return {
        timezone: created.timezone,
        buffer_minutes: created.bufferMinutes,
      };
    }

    return {
      timezone: settings.timezone,
      buffer_minutes: settings.bufferMinutes,
    };
  }
}

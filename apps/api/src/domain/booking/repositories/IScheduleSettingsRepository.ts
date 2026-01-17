import { ScheduleSettings } from '../entities/ScheduleSettings';

export interface IScheduleSettingsRepository {
  get(): Promise<ScheduleSettings | null>;
  upsert(params: { timezone: string; bufferMinutes: number }): Promise<ScheduleSettings>;
}

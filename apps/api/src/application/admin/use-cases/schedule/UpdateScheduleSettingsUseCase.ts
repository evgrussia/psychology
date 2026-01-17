import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IScheduleSettingsRepository } from '@domain/booking/repositories/IScheduleSettingsRepository';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '@application/audit/dto/audit-log.dto';
import { UpdateScheduleSettingsRequestDto } from '../../dto/schedule.dto';

@Injectable()
export class UpdateScheduleSettingsUseCase {
  constructor(
    @Inject('IScheduleSettingsRepository')
    private readonly scheduleSettingsRepository: IScheduleSettingsRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(dto: UpdateScheduleSettingsRequestDto, actorUserId: string, actorRole: string): Promise<void> {
    if (!this.isValidTimeZone(dto.timezone)) {
      throw new BadRequestException('Invalid timezone');
    }
    if (dto.buffer_minutes < 0) {
      throw new BadRequestException('Buffer minutes cannot be negative');
    }

    const existing = await this.scheduleSettingsRepository.get();
    const updated = await this.scheduleSettingsRepository.upsert({
      timezone: dto.timezone,
      bufferMinutes: dto.buffer_minutes,
    });

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      AuditLogAction.ADMIN_SETTINGS_CHANGED,
      'ScheduleSettings',
      updated.id,
      existing ? { timezone: existing.timezone, buffer_minutes: existing.bufferMinutes } : null,
      { timezone: updated.timezone, buffer_minutes: updated.bufferMinutes },
    );
  }

  private isValidTimeZone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }
}

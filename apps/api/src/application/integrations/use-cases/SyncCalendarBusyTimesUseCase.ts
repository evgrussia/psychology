import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { IGoogleCalendarService } from '@domain/integrations/services/IGoogleCalendarService';
import { GoogleCalendarTokenService } from '../services/GoogleCalendarTokenService';
import { GoogleCalendarSyncResultDto } from '../dto/google-calendar.dto';
import { AppLogger } from '@infrastructure/logging/logger.service';

export interface SyncCalendarBusyTimesParams {
  from: Date;
  to: Date;
}

@Injectable()
export class SyncCalendarBusyTimesUseCase {
  private readonly logger = new AppLogger('SyncCalendarBusyTimesUseCase');

  constructor(
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepo: IGoogleCalendarIntegrationRepository,
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
    @Inject('IGoogleCalendarService')
    private readonly googleCalendarService: IGoogleCalendarService,
    private readonly tokenService: GoogleCalendarTokenService,
  ) {}

  async execute(params: SyncCalendarBusyTimesParams): Promise<GoogleCalendarSyncResultDto> {
    const { from, to } = params;
    const integration = await this.integrationRepo.findLatest();

    if (!integration || integration.status !== GoogleCalendarIntegrationStatus.connected) {
      throw new Error('Google Calendar integration is not connected');
    }

    try {
      const accessToken = await this.tokenService.getValidAccessToken(integration);
      let calendarId = integration.calendarId || 'primary';
      let timezone = integration.timezone || 'UTC';

      if (!integration.calendarId || !integration.timezone) {
        const primary = await this.googleCalendarService.getPrimaryCalendar(accessToken);
        if (primary) {
          calendarId = primary.id;
          timezone = primary.timeZone;
          integration.update({
            calendarId: primary.id,
            timezone: primary.timeZone,
          });
        }
      }

      const busyIntervals = await this.googleCalendarService.listBusyIntervals(accessToken, calendarId, from, to);
      const now = new Date();
      const busySlots = busyIntervals.map((interval) =>
        AvailabilitySlot.create({
          id: randomUUID(),
          serviceId: null,
          startAtUtc: interval.start,
          endAtUtc: interval.end,
          status: SlotStatus.blocked,
          source: SlotSource.google_calendar,
          externalEventId: null,
          createdAt: now,
        }),
      );

      await this.slotRepository.replaceBusySlots(from, to, busySlots);

      integration.update({
        lastSyncAt: new Date(),
        lastSyncError: null,
        lastSyncRangeStartAt: from,
        lastSyncRangeEndAt: to,
        calendarId,
        timezone,
      });
      await this.integrationRepo.save(integration);

      return {
        status: 'success',
        syncedFrom: from,
        syncedTo: to,
        busyCount: busyIntervals.length,
        lastSyncAt: integration.lastSyncAt || new Date(),
      };
    } catch (error: any) {
      integration.update({
        lastSyncAt: new Date(),
        lastSyncError: error?.message || 'unknown_error',
        lastSyncRangeStartAt: from,
        lastSyncRangeEndAt: to,
      });
      await this.integrationRepo.save(integration);

      this.logger.error(
        {
          message: 'Google Calendar busy sync failed',
          reason: error?.message || 'unknown_error',
        },
        error?.stack,
      );

      return {
        status: 'failed',
        syncedFrom: from,
        syncedTo: to,
        busyCount: 0,
        lastSyncAt: integration.lastSyncAt || new Date(),
        errorMessage: error?.message || 'unknown_error',
      };
    }
  }
}

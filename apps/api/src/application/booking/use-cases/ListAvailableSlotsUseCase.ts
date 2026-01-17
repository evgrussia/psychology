import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { GoogleCalendarIntegrationStatus } from '@domain/integrations/value-objects/GoogleCalendarIntegrationStatus';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { SyncCalendarBusyTimesUseCase } from '@application/integrations/use-cases/SyncCalendarBusyTimesUseCase';
import { ListAvailableSlotsResponseDto } from '../dto/availability.dto';
import { TimeSlot } from '@domain/booking/value-objects/TimeSlot';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface ListAvailableSlotsParams {
  serviceSlug: string;
  from: string;
  to: string;
  timezone: string;
}

@Injectable()
export class ListAvailableSlotsUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
    @Inject('IGoogleCalendarIntegrationRepository')
    private readonly integrationRepository: IGoogleCalendarIntegrationRepository,
    private readonly syncCalendarBusyTimesUseCase: SyncCalendarBusyTimesUseCase,
  ) {}

  async execute(params: ListAvailableSlotsParams): Promise<ListAvailableSlotsResponseDto> {
    const { serviceSlug, from, to, timezone } = params;
    const fromDate = this.parseDate(from, 'from');
    const toDate = this.parseDate(to, 'to');

    if (fromDate >= toDate) {
      throw new BadRequestException('Invalid date range');
    }

    if (!this.isValidTimeZone(timezone)) {
      throw new BadRequestException('Invalid timezone');
    }

    const service = await this.serviceRepository.findBySlug(serviceSlug);
    if (!service || service.status !== ServiceStatus.published) {
      throw new NotFoundException(`Service with slug "${serviceSlug}" not found`);
    }

    const integration = await this.integrationRepository.findLatest();
    if (!integration || integration.status !== GoogleCalendarIntegrationStatus.connected) {
      return {
        status: 'calendar_unavailable',
        timezone,
        service_id: service.id,
        service_slug: service.slug,
        service_title: service.title,
        range: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        slots: [],
        message: 'calendar_unavailable',
      };
    }

    const isCacheValid = this.isSyncCacheValid(integration, fromDate, toDate);
    if (!isCacheValid) {
      const result = await this.syncCalendarBusyTimesUseCase.execute({ from: fromDate, to: toDate });
      if (result.status !== 'success') {
        return {
          status: 'calendar_unavailable',
          timezone,
          service_id: service.id,
          service_slug: service.slug,
          service_title: service.title,
          range: {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
          slots: [],
          message: 'calendar_unavailable',
        };
      }
    }

    const availableSlots = await this.slotRepository.findAvailableSlots(service.id, fromDate, toDate);
    const busySlots = await this.slotRepository.findBusySlots(fromDate, toDate);
    const blockedSlots = await this.slotRepository.findBlockedSlots(fromDate, toDate);

    const busyTimeSlots = [...busySlots, ...blockedSlots].map(
      (slot) => new TimeSlot(slot.startAtUtc, slot.endAtUtc),
    );
    const filteredSlots = availableSlots.filter((slot) => {
      const candidate = new TimeSlot(slot.startAtUtc, slot.endAtUtc);
      return !busyTimeSlots.some((busy) => busy.overlaps(candidate));
    });

    return {
      status: 'available',
      timezone,
      service_id: service.id,
      service_slug: service.slug,
      service_title: service.title,
      range: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      slots: filteredSlots.map((slot) => ({
        id: slot.id,
        start_at_utc: slot.startAtUtc.toISOString(),
        end_at_utc: slot.endAtUtc.toISOString(),
      })),
    };
  }

  private isSyncCacheValid(
    integration: {
      lastSyncAt?: Date | null;
      lastSyncRangeStartAt?: Date | null;
      lastSyncRangeEndAt?: Date | null;
      lastSyncError?: string | null;
    },
    from: Date,
    to: Date,
  ): boolean {
    if (!integration.lastSyncAt || !integration.lastSyncRangeStartAt || !integration.lastSyncRangeEndAt) {
      return false;
    }

    if (integration.lastSyncError) {
      return false;
    }

    const withinRange = from >= integration.lastSyncRangeStartAt && to <= integration.lastSyncRangeEndAt;
    const notExpired = Date.now() - integration.lastSyncAt.getTime() <= CACHE_TTL_MS;
    return withinRange && notExpired;
  }

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName} date`);
    }
    return date;
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

import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { TimeSlot } from '@domain/booking/value-objects/TimeSlot';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { PreferredTimeWindow } from '@domain/booking/value-objects/BookingEnums';
import {
  AlternativeDayDto,
  AlternativeSlotDto,
  BookingAlternativesResponseDto,
  FormatAlternativeDto,
  FormatAlternativeServiceDto,
  TimeWindowAlternativeDto,
} from '../dto/alternatives.dto';

const BASE_RANGE_DAYS = 14;
const ALT_RANGE_DAYS = 60;
const MAX_NEXT_SLOTS = 6;
const MAX_NEXT_DAYS = 3;
const MAX_FORMAT_ALTERNATIVES = 3;
export interface GetBookingAlternativesParams {
  serviceSlug: string;
  timezone: string;
  from?: string;
  to?: string;
  selectedFormat?: ServiceFormat;
}

@Injectable()
export class GetBookingAlternativesUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(params: GetBookingAlternativesParams): Promise<BookingAlternativesResponseDto> {
    const { serviceSlug, timezone, from, to, selectedFormat } = params;
    const { fromDate, toDate } = this.resolveBaseRange(from, to);

    if (!this.isValidTimeZone(timezone)) {
      throw new BadRequestException('Invalid timezone');
    }

    const service = await this.serviceRepository.findBySlug(serviceSlug);
    if (!service || service.status !== ServiceStatus.published) {
      throw new NotFoundException(`Service with slug "${serviceSlug}" not found`);
    }

    const altRangeFrom = toDate;
    const altRangeTo = new Date(toDate.getTime() + ALT_RANGE_DAYS * 24 * 60 * 60 * 1000);

    const baseSlots = await this.loadAvailableSlots(service.id, fromDate, toDate);
    const alternativeSlots = await this.loadAvailableSlots(service.id, altRangeFrom, altRangeTo);

    const nextSlots = alternativeSlots.slice(0, MAX_NEXT_SLOTS).map((slot) => this.toSlotDto(slot));
    const nextDays = this.buildDaySuggestions(alternativeSlots, timezone);
    const timeWindows = this.buildWindowSuggestions(alternativeSlots, timezone);
    const formatAlternatives = await this.buildFormatAlternatives(
      service,
      selectedFormat ?? service.format,
      fromDate,
      altRangeTo,
    );

    return {
      status: 'available',
      timezone,
      service: {
        id: service.id,
        slug: service.slug,
        title: service.title,
        format: service.format,
        topic_code: service.topicCode ?? null,
      },
      base_range: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      alternative_range: {
        from: altRangeFrom.toISOString(),
        to: altRangeTo.toISOString(),
      },
      has_slots_in_range: baseSlots.length > 0,
      next_slots: nextSlots,
      next_days: nextDays,
      time_windows: timeWindows,
      format_alternatives: formatAlternatives,
    };
  }

  private resolveBaseRange(from?: string, to?: string): { fromDate: Date; toDate: Date } {
    if ((from && !to) || (!from && to)) {
      throw new BadRequestException('Both from and to are required when specifying a range');
    }

    if (from && to) {
      const fromDate = this.parseDate(from, 'from');
      const toDate = this.parseDate(to, 'to');
      if (fromDate >= toDate) {
        throw new BadRequestException('Invalid date range');
      }
      return { fromDate, toDate };
    }

    const fromDate = new Date();
    const toDate = new Date(fromDate.getTime() + BASE_RANGE_DAYS * 24 * 60 * 60 * 1000);
    return { fromDate, toDate };
  }

  private async loadAvailableSlots(serviceId: string, from: Date, to: Date) {
    const availableSlots = await this.slotRepository.findAvailableSlots(serviceId, from, to);
    const reservedSlots = await this.slotRepository.findReservedSlots(from, to);
    const blockedSlots = await this.slotRepository.findBlockedSlots(from, to);
    const busyAppointments = await this.appointmentRepository.findBusyInRange(from, to);

    const busyTimeSlots = [
      ...reservedSlots.map((slot) => new TimeSlot(slot.startAtUtc, slot.endAtUtc)),
      ...blockedSlots.map((slot) => new TimeSlot(slot.startAtUtc, slot.endAtUtc)),
      ...busyAppointments.map((appointment) => new TimeSlot(appointment.startAtUtc, appointment.endAtUtc)),
    ];

    return availableSlots.filter((slot) => {
      const candidate = new TimeSlot(slot.startAtUtc, slot.endAtUtc);
      return !busyTimeSlots.some((busy) => busy.overlaps(candidate));
    });
  }

  private buildDaySuggestions(
    slots: { startAtUtc: Date; endAtUtc: Date; id: string }[],
    timezone: string,
  ): AlternativeDayDto[] {
    const daysMap = new Map<string, { count: number; firstSlot: AlternativeSlotDto }>();

    for (const slot of slots) {
      const dateKey = this.getLocalDateKey(slot.startAtUtc, timezone);
      if (!daysMap.has(dateKey)) {
        if (daysMap.size >= MAX_NEXT_DAYS) {
          break;
        }
        daysMap.set(dateKey, { count: 1, firstSlot: this.toSlotDto(slot) });
      } else {
        const current = daysMap.get(dateKey)!;
        current.count += 1;
      }
    }

    return Array.from(daysMap.entries()).map(([date, value]) => ({
      date,
      slot_count: value.count,
      first_slot: value.firstSlot,
    }));
  }

  private buildWindowSuggestions(
    slots: { startAtUtc: Date; endAtUtc: Date; id: string }[],
    timezone: string,
  ): TimeWindowAlternativeDto[] {
    const windows: Record<PreferredTimeWindow, AlternativeSlotDto | null> = {
      [PreferredTimeWindow.weekday_morning]: null,
      [PreferredTimeWindow.weekday_evening]: null,
      [PreferredTimeWindow.weekend]: null,
      [PreferredTimeWindow.any]: null,
    };

    for (const slot of slots) {
      const window = this.resolveTimeWindow(slot.startAtUtc, timezone);
      if (!windows[window]) {
        windows[window] = this.toSlotDto(slot);
      }
      if (!windows[PreferredTimeWindow.any]) {
        windows[PreferredTimeWindow.any] = this.toSlotDto(slot);
      }
      if (windows[PreferredTimeWindow.weekday_morning] && windows[PreferredTimeWindow.weekday_evening] && windows[PreferredTimeWindow.weekend]) {
        break;
      }
    }

    return [
      { window: PreferredTimeWindow.weekday_morning, slot: windows[PreferredTimeWindow.weekday_morning] },
      { window: PreferredTimeWindow.weekday_evening, slot: windows[PreferredTimeWindow.weekday_evening] },
      { window: PreferredTimeWindow.weekend, slot: windows[PreferredTimeWindow.weekend] },
    ];
  }

  private async buildFormatAlternatives(
    service: { id: string; topicCode?: string | null },
    selectedFormat: ServiceFormat,
    from: Date,
    to: Date,
  ): Promise<FormatAlternativeDto[]> {
    if (!service.topicCode) {
      return [];
    }

    const sameTopic = await this.serviceRepository.findByTopic(service.topicCode, ServiceStatus.published);
    const candidates = sameTopic
      .filter((item) => item.id !== service.id && item.format !== selectedFormat)
      .slice(0, MAX_FORMAT_ALTERNATIVES);

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const slots = await this.loadAvailableSlots(candidate.id, from, to);
        const earliest = slots.length > 0 ? this.toSlotDto(slots[0]) : null;
        const serviceDto: FormatAlternativeServiceDto = {
          id: candidate.id,
          slug: candidate.slug,
          title: candidate.title,
          format: candidate.format,
          duration_minutes: candidate.durationMinutes,
          price_amount: candidate.priceAmount,
          deposit_amount: candidate.depositAmount ?? null,
          offline_address: candidate.offlineAddress ?? null,
        };
        return {
          service: serviceDto,
          earliest_slot: earliest,
        };
      }),
    );

    return results.filter((item) => item.earliest_slot !== null);
  }

  private toSlotDto(slot: { id: string; startAtUtc: Date; endAtUtc: Date }): AlternativeSlotDto {
    return {
      id: slot.id,
      start_at_utc: slot.startAtUtc.toISOString(),
      end_at_utc: slot.endAtUtc.toISOString(),
    };
  }

  private resolveTimeWindow(date: Date, timezone: string): PreferredTimeWindow {
    const { weekday, hour } = this.getLocalDateParts(date, timezone);
    const isWeekend = weekday === 'Sat' || weekday === 'Sun';
    if (isWeekend) {
      return PreferredTimeWindow.weekend;
    }
    if (hour < 15 && hour >= 6) {
      return PreferredTimeWindow.weekday_morning;
    }
    return PreferredTimeWindow.weekday_evening;
  }

  private getLocalDateKey(date: Date, timezone: string): string {
    const { year, month, day } = this.getLocalDateParts(date, timezone);
    return `${year}-${month}-${day}`;
  }

  private getLocalDateParts(date: Date, timezone: string): { year: string; month: string; day: string; weekday: string; hour: number } {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') {
        map[part.type] = part.value;
      }
    });
    return {
      year: map.year,
      month: map.month,
      day: map.day,
      weekday: map.weekday,
      hour: Number(map.hour ?? '0'),
    };
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

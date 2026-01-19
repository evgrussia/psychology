import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { ListAvailableSlotsResponseDto } from '../dto/availability.dto';
import { TimeSlot } from '@domain/booking/value-objects/TimeSlot';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

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
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
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

    const availableSlots = await this.slotRepository.findAvailableSlots(service.id, fromDate, toDate);
    const reservedSlots = await this.slotRepository.findReservedSlots(fromDate, toDate);
    const blockedSlots = await this.slotRepository.findBlockedSlots(fromDate, toDate);
    const busyAppointments = await this.appointmentRepository.findBusyInRange(fromDate, toDate);

    const busyTimeSlots = [
      ...reservedSlots.map((slot) => new TimeSlot(slot.startAtUtc, slot.endAtUtc)),
      ...blockedSlots.map((slot) => new TimeSlot(slot.startAtUtc, slot.endAtUtc)),
      ...busyAppointments.map((appointment) => new TimeSlot(appointment.startAtUtc, appointment.endAtUtc)),
    ];
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

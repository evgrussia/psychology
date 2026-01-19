import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { Appointment } from '@domain/booking/entities/Appointment';
import { AppointmentStatus, SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { StartBookingRequestDto, StartBookingResponseDto } from '../dto/booking.dto';
import * as crypto from 'crypto';
import { BookingConflictError, BookingTimeoutError, IdempotencyKeyConflictError } from '@domain/booking/errors/BookingErrors';
import { TrackingService } from '@infrastructure/tracking/tracking.service';

@Injectable()
export class StartBookingUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(dto: StartBookingRequestDto): Promise<StartBookingResponseDto> {
    if (!dto.service_slug || !dto.slot_id || !dto.timezone) {
      throw new BadRequestException('Missing required fields');
    }

    if (!this.isValidTimeZone(dto.timezone)) {
      throw new BadRequestException('Invalid timezone');
    }

    const service = await this.serviceRepository.findBySlug(dto.service_slug);
    if (!service || service.status !== ServiceStatus.published) {
      throw new NotFoundException('Service not found');
    }

    const slot = await this.slotRepository.findById(dto.slot_id);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (slot.serviceId && slot.serviceId !== service.id) {
      throw new BadRequestException('Slot does not match selected service');
    }

    if (slot.startAtUtc <= new Date()) {
      throw new BadRequestException('Slot is in the past');
    }

    const format = dto.format ?? service.format;
    if (!this.isFormatAllowed(format, service.format)) {
      throw new BadRequestException('Service does not support selected format');
    }

    const idempotencyKey = dto.client_request_id?.trim() || null;
    if (idempotencyKey) {
      const existingAppointment = await this.appointmentRepository.findByClientRequestId(idempotencyKey);
      if (existingAppointment) {
        if (
          existingAppointment.serviceId !== service.id ||
          existingAppointment.slotId !== slot.id ||
          existingAppointment.format !== format
        ) {
          throw new ConflictException({
            code: 'idempotency_conflict',
            message: 'Idempotency key already used for another booking request',
          });
        }

        return this.buildResponse(existingAppointment, service, slot, existingAppointment.format);
      }
    }

    if (slot.status !== SlotStatus.available) {
      await this.trackingService.trackBookingConflict({
        serviceId: service.id,
        serviceSlug: service.slug,
        leadId: dto.lead_id ?? null,
      });
      throw new ConflictException({ code: 'slot_conflict' });
    }

    const now = new Date();
    const appointment = Appointment.create({
      id: crypto.randomUUID(),
      serviceId: service.id,
      clientUserId: null,
      leadId: dto.lead_id ?? null,
      clientRequestId: idempotencyKey,
      startAtUtc: slot.startAtUtc,
      endAtUtc: slot.endAtUtc,
      timezone: dto.timezone,
      format,
      status: AppointmentStatus.pending_payment,
      slotId: slot.id,
      createdAt: now,
      updatedAt: now,
    });

    try {
      await this.appointmentRepository.createWithConflictCheck(appointment);
    } catch (error) {
      if (error instanceof IdempotencyKeyConflictError && idempotencyKey) {
        const existingAppointment = await this.appointmentRepository.findByClientRequestId(idempotencyKey);
        if (existingAppointment) {
          return this.buildResponse(existingAppointment, service, slot, existingAppointment.format);
        }
      }

      if (error instanceof BookingTimeoutError) {
        throw new RequestTimeoutException('Slot reservation timed out');
      }

      if (error instanceof BookingConflictError) {
        await this.trackingService.trackBookingConflict({
          serviceId: service.id,
          serviceSlug: service.slug,
          leadId: dto.lead_id ?? null,
        });
        throw new ConflictException({ code: 'slot_conflict' });
      }

      throw error;
    }

    return this.buildResponse(appointment, service, slot, format);
  }

  private isValidTimeZone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  private isFormatAllowed(selected: ServiceFormat, serviceFormat: ServiceFormat): boolean {
    if (serviceFormat === ServiceFormat.hybrid) {
      return selected === ServiceFormat.online || selected === ServiceFormat.offline;
    }
    return selected === serviceFormat;
  }

  private buildResponse(
    appointment: Appointment,
    service: {
      id: string;
      slug: string;
      title: string;
      durationMinutes: number;
      priceAmount: number;
      depositAmount?: number | null;
    },
    slot: { id: string; startAtUtc: Date; endAtUtc: Date },
    format: ServiceFormat,
  ): StartBookingResponseDto {
    return {
      appointment_id: appointment.id,
      status: appointment.status,
      service: {
        id: service.id,
        slug: service.slug,
        title: service.title,
        format,
        duration_minutes: service.durationMinutes,
        price_amount: service.priceAmount,
        deposit_amount: service.depositAmount ?? null,
      },
      slot: {
        id: slot.id,
        start_at_utc: slot.startAtUtc.toISOString(),
        end_at_utc: slot.endAtUtc.toISOString(),
      },
    };
  }
}

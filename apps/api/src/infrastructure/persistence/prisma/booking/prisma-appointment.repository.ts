import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../database/prisma.service';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { Appointment } from '@domain/booking/entities/Appointment';
import { AppointmentMapper } from './appointment.mapper';
import { AppointmentStatus, SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { BookingConflictError, BookingTimeoutError, IdempotencyKeyConflictError } from '@domain/booking/errors/BookingErrors';

const DEFAULT_TX_TIMEOUT_MS = Number(process.env.BOOKING_TX_TIMEOUT_MS ?? 8000);
const DEFAULT_TX_MAX_WAIT_MS = Number(process.env.BOOKING_TX_MAX_WAIT_MS ?? 2000);
const DEFAULT_TX_MAX_RETRIES = Number(process.env.BOOKING_TX_MAX_RETRIES ?? 2);

@Injectable()
export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Appointment | null> {
    const record = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!record) return null;
    return AppointmentMapper.toDomain(record);
  }

  async findByClientRequestId(clientRequestId: string): Promise<Appointment | null> {
    const record = await this.prisma.appointment.findUnique({
      where: { client_request_id: clientRequestId },
    });
    if (!record) return null;
    return AppointmentMapper.toDomain(record);
  }

  async findByClientUserId(clientUserId: string): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: { client_user_id: clientUserId },
      orderBy: { start_at_utc: 'desc' },
    });
    return records.map(AppointmentMapper.toDomain);
  }

  async create(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.create({
      data: {
        id: appointment.id,
        service_id: appointment.serviceId,
        client_user_id: appointment.clientUserId ?? null,
        lead_id: appointment.leadId ?? null,
        client_request_id: appointment.clientRequestId ?? null,
        start_at_utc: appointment.startAtUtc,
        end_at_utc: appointment.endAtUtc,
        timezone: appointment.timezone,
        format: appointment.format,
        status: appointment.status,
        slot_id: appointment.slotId ?? null,
        external_calendar_event_id: appointment.externalCalendarEventId ?? null,
        created_at: appointment.createdAt,
        updated_at: appointment.updatedAt,
      },
    });
  }

  async createWithConflictCheck(appointment: Appointment): Promise<void> {
    const maxRetries = Number.isFinite(DEFAULT_TX_MAX_RETRIES) ? DEFAULT_TX_MAX_RETRIES : 2;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        await this.prisma.$transaction(async (tx) => {
          if (!appointment.slotId) {
            throw new BookingConflictError('Slot is required for booking');
          }

          const reserveResult = await tx.availabilitySlot.updateMany({
            where: {
              id: appointment.slotId,
              status: SlotStatus.available,
            },
            data: { status: SlotStatus.reserved },
          });

          if (reserveResult.count === 0) {
            throw new BookingConflictError('Slot is already reserved');
          }

          const conflict = await tx.appointment.findFirst({
            where: {
              start_at_utc: { lt: appointment.endAtUtc },
              end_at_utc: { gt: appointment.startAtUtc },
              status: { in: [AppointmentStatus.pending_payment, AppointmentStatus.paid, AppointmentStatus.confirmed] },
            },
            select: { id: true },
          });

          if (conflict) {
            throw new BookingConflictError('Slot time overlaps with another appointment');
          }

          await tx.appointment.create({
            data: {
              id: appointment.id,
              service_id: appointment.serviceId,
              client_user_id: appointment.clientUserId ?? null,
              lead_id: appointment.leadId ?? null,
              client_request_id: appointment.clientRequestId ?? null,
              start_at_utc: appointment.startAtUtc,
              end_at_utc: appointment.endAtUtc,
              timezone: appointment.timezone,
              format: appointment.format,
              status: appointment.status,
              slot_id: appointment.slotId ?? null,
              external_calendar_event_id: appointment.externalCalendarEventId ?? null,
              created_at: appointment.createdAt,
              updated_at: appointment.updatedAt,
            },
          });
        }, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: DEFAULT_TX_MAX_WAIT_MS,
          timeout: DEFAULT_TX_TIMEOUT_MS,
        });
        return;
      } catch (error) {
        if (error instanceof BookingConflictError) {
          throw error;
        }
        if (error instanceof PrismaClientKnownRequestError) {
          const target = error.meta?.target;
          const targetHasClientRequestId =
            (Array.isArray(target) && target.includes('client_request_id')) ||
            (typeof target === 'string' && target.includes('client_request_id'));
          if (error.code === 'P2002' && targetHasClientRequestId) {
            throw new IdempotencyKeyConflictError('Idempotency key already used');
          }
          if (error.code === 'P2034' && attempt < maxRetries) {
            continue;
          }
          if (error.code === 'P2028') {
            throw new BookingTimeoutError('Transaction timed out');
          }
        }
        throw error;
      }
    }
  }

  async attachClientUser(appointmentId: string, clientUserId: string): Promise<void> {
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        client_user_id: clientUserId,
      },
    });
  }

  async findConfirmedWithoutCalendarEvent(from: Date, to: Date): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.confirmed,
        external_calendar_event_id: null,
        start_at_utc: { gte: from, lt: to },
      },
      orderBy: { start_at_utc: 'asc' },
    });
    return records.map(AppointmentMapper.toDomain);
  }

  async setExternalCalendarEventIdIfMatch(
    appointmentId: string,
    expectedValue: string | null,
    newValue: string,
  ): Promise<boolean> {
    const result = await this.prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        external_calendar_event_id: expectedValue,
      },
      data: {
        external_calendar_event_id: newValue,
      },
    });

    return result.count > 0;
  }

  async clearExternalCalendarEventId(appointmentId: string, expectedValue: string): Promise<void> {
    await this.prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        external_calendar_event_id: expectedValue,
      },
      data: {
        external_calendar_event_id: null,
      },
    });
  }

  async markPaidIfPending(appointmentId: string): Promise<boolean> {
    const result = await this.prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        status: AppointmentStatus.pending_payment,
      },
      data: {
        status: AppointmentStatus.paid,
      },
    });
    return result.count > 0;
  }

  async confirmIfPending(appointmentId: string): Promise<boolean> {
    const result = await this.prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        status: AppointmentStatus.paid,
      },
      data: {
        status: AppointmentStatus.confirmed,
      },
    });
    return result.count > 0;
  }

  async save(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        service_id: appointment.serviceId,
        client_user_id: appointment.clientUserId ?? null,
        lead_id: appointment.leadId ?? null,
        client_request_id: appointment.clientRequestId ?? null,
        start_at_utc: appointment.startAtUtc,
        end_at_utc: appointment.endAtUtc,
        timezone: appointment.timezone,
        format: appointment.format,
        status: appointment.status,
        slot_id: appointment.slotId ?? null,
        external_calendar_event_id: appointment.externalCalendarEventId ?? null,
        updated_at: appointment.updatedAt,
      },
    });
  }
}

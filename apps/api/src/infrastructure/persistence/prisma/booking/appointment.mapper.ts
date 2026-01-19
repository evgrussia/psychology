import { Appointment as PrismaAppointment, AppointmentStatus as PrismaAppointmentStatus, ServiceFormat as PrismaServiceFormat } from '@prisma/client';
import { Appointment } from '@domain/booking/entities/Appointment';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';

export class AppointmentMapper {
  static toDomain(record: PrismaAppointment): Appointment {
    return Appointment.create({
      id: record.id,
      serviceId: record.service_id,
      clientUserId: record.client_user_id,
      leadId: record.lead_id,
      clientRequestId: record.client_request_id,
      startAtUtc: record.start_at_utc,
      endAtUtc: record.end_at_utc,
      timezone: record.timezone,
      format: this.mapFormatToDomain(record.format),
      status: this.mapStatusToDomain(record.status),
      outcome: record.outcome,
      outcomeReasonCategory: record.outcome_reason_category,
      outcomeRecordedAt: record.outcome_recorded_at,
      outcomeRecordedByRole: record.outcome_recorded_by_role,
      slotId: record.slot_id,
      externalCalendarEventId: record.external_calendar_event_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  private static mapStatusToDomain(status: PrismaAppointmentStatus): AppointmentStatus {
    switch (status) {
      case PrismaAppointmentStatus.pending_payment:
        return AppointmentStatus.pending_payment;
      case PrismaAppointmentStatus.paid:
        return AppointmentStatus.paid;
      case PrismaAppointmentStatus.confirmed:
        return AppointmentStatus.confirmed;
      case PrismaAppointmentStatus.canceled:
        return AppointmentStatus.canceled;
      case PrismaAppointmentStatus.rescheduled:
        return AppointmentStatus.rescheduled;
      case PrismaAppointmentStatus.completed:
        return AppointmentStatus.completed;
      default:
        throw new Error(`Unknown AppointmentStatus: ${status}`);
    }
  }

  private static mapFormatToDomain(format: PrismaServiceFormat): ServiceFormat {
    switch (format) {
      case PrismaServiceFormat.online:
        return ServiceFormat.online;
      case PrismaServiceFormat.offline:
        return ServiceFormat.offline;
      case PrismaServiceFormat.hybrid:
        return ServiceFormat.hybrid;
      default:
        throw new Error(`Unknown ServiceFormat: ${format}`);
    }
  }
}

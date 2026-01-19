import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '@application/audit/dto/audit-log.dto';

const ALLOWED_OUTCOMES = new Set([
  'attended',
  'no_show',
  'canceled_by_client',
  'canceled_by_provider',
  'rescheduled',
]);

const ALLOWED_REASON_CATEGORIES = new Set([
  'late_cancel',
  'tech_issue',
  'illness',
  'other',
  'unknown',
]);

@Injectable()
export class RecordAppointmentOutcomeUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(params: {
    appointmentId: string;
    outcome: string;
    reasonCategory?: string | null;
    recordedByRole: string;
    recordedByUserId?: string | null;
  }): Promise<void> {
    if (!ALLOWED_OUTCOMES.has(params.outcome)) {
      throw new BadRequestException('Unsupported outcome');
    }

    if (params.reasonCategory && !ALLOWED_REASON_CATEGORIES.has(params.reasonCategory)) {
      throw new BadRequestException('Unsupported reason category');
    }

    const appointment = await this.appointmentRepository.findById(params.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (![AppointmentStatus.completed, AppointmentStatus.canceled, AppointmentStatus.rescheduled].includes(appointment.status)) {
      throw new BadRequestException('Cannot record outcome for active appointment');
    }

    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const previousOutcome = {
      outcome: appointment.outcome ?? null,
      reason_category: appointment.outcomeReasonCategory ?? null,
      recorded_at: appointment.outcomeRecordedAt ?? null,
      recorded_by_role: appointment.outcomeRecordedByRole ?? null,
    };

    appointment.recordOutcome(params.outcome, params.reasonCategory ?? null, params.recordedByRole);
    await this.appointmentRepository.save(appointment);

    await this.auditLogHelper.logAction(
      params.recordedByUserId ?? null,
      params.recordedByRole,
      AuditLogAction.ADMIN_APPOINTMENT_OUTCOME_RECORDED,
      'Appointment',
      appointment.id,
      previousOutcome,
      {
        outcome: appointment.outcome,
        reason_category: appointment.outcomeReasonCategory,
        recorded_at: appointment.outcomeRecordedAt,
        recorded_by_role: appointment.outcomeRecordedByRole,
      },
    );

    const deepLinkId = appointment.leadId
      ? await this.leadRepository.findLatestDeepLinkId(appointment.leadId)
      : null;

    await this.trackingService.trackAppointmentOutcomeRecorded({
      appointmentId: appointment.id,
      scheduledStartAt: appointment.startAtUtc,
      serviceId: service.id,
      serviceSlug: service.slug,
      outcome: params.outcome,
      recordedByRole: params.recordedByRole,
      reasonCategory: params.reasonCategory ?? null,
      leadId: appointment.leadId ?? null,
      deepLinkId,
    });
  }
}

import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '@application/audit/dto/audit-log.dto';

@Injectable()
export class CancelAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(appointmentId: string, actorUserId: string, actorRole: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.status === AppointmentStatus.completed) {
      throw new BadRequestException('Cannot cancel completed appointment');
    }
    const oldStatus = appointment.status;
    appointment.updateStatus(AppointmentStatus.canceled);
    await this.appointmentRepository.save(appointment);

    if (appointment.slotId) {
      await this.slotRepository.releaseSlot(appointment.slotId);
    }

    await this.auditLogHelper.logAction(
      actorUserId,
      actorRole,
      AuditLogAction.ADMIN_APPOINTMENT_DELETED,
      'Appointment',
      appointment.id,
      { status: oldStatus },
      { status: AppointmentStatus.canceled },
    );
  }
}

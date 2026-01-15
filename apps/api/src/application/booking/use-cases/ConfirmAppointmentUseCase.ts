import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { IEmailService } from '@domain/notifications/services/IEmailService';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { IEventBus } from '@domain/events/event-bus.interface';
import { AppointmentConfirmedEvent } from '@domain/booking/events/AppointmentConfirmedEvent';

@Injectable()
export class ConfirmAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async execute(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.confirmed) {
      return;
    }

    const confirmed = await this.appointmentRepository.confirmIfPending(appointment.id);
    if (!confirmed) {
      return;
    }

    // Fire domain event
    await this.eventBus.publish(
      new AppointmentConfirmedEvent(
        appointment.id,
        appointment.serviceId,
        appointment.startAtUtc,
        appointment.endAtUtc,
        appointment.timezone,
      ),
    );

    // Send confirmation email
    if (appointment.clientUserId) {
      const user = await this.userRepository.findById(appointment.clientUserId);
      if (user && user.email) {
        await this.emailService.sendEmail(
          user.email.value,
          'Запись подтверждена',
          `Ваша запись на ${appointment.startAtUtc.toLocaleString()} подтверждена.`,
        );
      }
    }
  }
}

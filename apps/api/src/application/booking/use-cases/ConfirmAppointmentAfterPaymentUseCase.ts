import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { IEmailService } from '@domain/notifications/services/IEmailService';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { IEventBus } from '@domain/events/event-bus.interface';
import { AppointmentConfirmedEvent } from '@domain/booking/events/AppointmentConfirmedEvent';
import { IPaymentRepository } from '@domain/payment/repositories/IPaymentRepository';
import { PaymentStatus } from '@domain/payment/value-objects/PaymentEnums';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { Appointment } from '@domain/booking/entities/Appointment';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';

@Injectable()
export class ConfirmAppointmentAfterPaymentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.confirmed) {
      return;
    }

    const latestPayment = await this.paymentRepository.findLatestByAppointmentId(appointment.id);
    if (!latestPayment || latestPayment.status !== PaymentStatus.succeeded) {
      return;
    }

    if (appointment.status === AppointmentStatus.pending_payment) {
      await this.appointmentRepository.markPaidIfPending(appointment.id);
    }

    const confirmed = await this.appointmentRepository.confirmIfPending(appointment.id);
    if (!confirmed) {
      return;
    }

    await this.eventBus.publish(
      new AppointmentConfirmedEvent(
        appointment.id,
        appointment.serviceId,
        appointment.startAtUtc,
        appointment.endAtUtc,
        appointment.timezone,
      ),
    );

    await this.trackBookingConfirmed(appointment);
    await this.sendConfirmationEmail(appointment);
  }

  private async trackBookingConfirmed(appointment: Appointment): Promise<void> {
    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      return;
    }
    const deepLinkId = appointment.leadId
      ? await this.leadRepository.findLatestDeepLinkId(appointment.leadId)
      : null;

    await this.trackingService.trackBookingConfirmed({
      appointmentStartAt: appointment.startAtUtc,
      timezone: appointment.timezone,
      serviceId: service.id,
      serviceSlug: service.slug,
      format: appointment.format,
      leadId: appointment.leadId ?? null,
      deepLinkId,
    });
  }

  private async sendConfirmationEmail(appointment: Appointment): Promise<void> {
    if (!appointment.clientUserId) {
      return;
    }

    const user = await this.userRepository.findById(appointment.clientUserId);
    if (!user || !user.email) {
      return;
    }

    const dateStr = appointment.startAtUtc.toLocaleDateString('ru-RU');
    const timeStr = appointment.startAtUtc.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    await this.emailService.sendEmail(
      user.email.value,
      'Запись подтверждена',
      `Ваша запись на ${dateStr} в ${timeStr} подтверждена. Мы ждем вас!`,
    );
  }
}

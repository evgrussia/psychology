import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPaymentWebhookEventRepository } from '@domain/payment/repositories/IPaymentWebhookEventRepository';
import { IPaymentRepository } from '@domain/payment/repositories/IPaymentRepository';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { ConfirmAppointmentAfterPaymentUseCase } from '@application/booking/use-cases/ConfirmAppointmentAfterPaymentUseCase';
import { PaymentProvider, PaymentStatus } from '@domain/payment/value-objects/PaymentEnums';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';

@Injectable()
export class HandlePaymentWebhookUseCase {
  private readonly logger = new Logger(HandlePaymentWebhookUseCase.name);

  constructor(
    @Inject('IPaymentWebhookEventRepository')
    private readonly webhookEventRepository: IPaymentWebhookEventRepository,
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    private readonly confirmAppointmentUseCase: ConfirmAppointmentAfterPaymentUseCase,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(payload: any): Promise<{ status: string }> {
    const provider = PaymentProvider.yookassa;
    const providerEventId = payload?.id || null;
    const eventType = payload?.event || null;
    const object = payload?.object;
    const providerPaymentId = object?.id || null;

    if (providerEventId) {
      const alreadyProcessed = await this.webhookEventRepository.isProcessed(provider, providerEventId);
      if (alreadyProcessed) {
        return { status: 'duplicate' };
      }

      const received = await this.webhookEventRepository.markReceived(provider, providerEventId);
      if (!received) {
        const processedAfterConflict = await this.webhookEventRepository.isProcessed(provider, providerEventId);
        if (processedAfterConflict) {
          return { status: 'duplicate' };
        }
      }
    }

    try {
      if (!providerPaymentId) {
        this.logger.warn('Webhook payload without payment id received.');
        return { status: 'ignored' };
      }

      const payment = await this.paymentRepository.findByProviderPaymentId(provider, providerPaymentId);
      if (!payment) {
        this.logger.warn(`Webhook for unknown payment received. payment_id=${providerPaymentId}`);
        return { status: 'unknown_payment' };
      }

      if (object?.status === 'succeeded') {
        if (payment.status !== PaymentStatus.succeeded) {
          const updated = await this.paymentRepository.updateStatus({
            provider,
            providerPaymentId,
            status: PaymentStatus.succeeded,
            confirmedAt: new Date(),
          });

          if (updated) {
            await this.trackBookingPaid(payment);
          }
        }

        await this.appointmentRepository.markPaidIfPending(payment.appointmentId);
        await this.confirmAppointmentUseCase.execute(payment.appointmentId);
        return { status: 'ok' };
      }

      if (object?.status === 'canceled' || object?.status === 'failed') {
        if (payment.status === PaymentStatus.succeeded) {
          return { status: 'ignored' };
        }

        if (payment.status === PaymentStatus.canceled || payment.status === PaymentStatus.failed) {
          return { status: 'already_final' };
        }

        const failureCategory = this.mapFailureCategory(object?.cancellation_details?.reason);
        await this.paymentRepository.updateStatus({
          provider,
          providerPaymentId,
          status: object?.status === 'failed' ? PaymentStatus.failed : PaymentStatus.canceled,
          failureCategory,
        });
        await this.trackPaymentFailed(payment, failureCategory);
        return { status: 'ok' };
      }

      this.logger.log(`Unhandled webhook event. type=${eventType ?? 'unknown'} status=${object?.status ?? 'unknown'}`);
      return { status: 'ignored' };
    } finally {
      if (providerEventId) {
        await this.webhookEventRepository.markProcessed(provider, providerEventId);
      }
    }
  }

  private async trackBookingPaid(payment: { appointmentId: string; amount: number; currency: string }): Promise<void> {
    const appointment = await this.appointmentRepository.findById(payment.appointmentId);
    if (!appointment) {
      return;
    }
    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      return;
    }
    const deepLinkId = appointment.leadId
      ? await this.leadRepository.findLatestDeepLinkId(appointment.leadId)
      : null;
    await this.trackingService.trackBookingPaid({
      paymentProvider: PaymentProvider.yookassa,
      amount: payment.amount,
      currency: payment.currency,
      serviceId: service.id,
      serviceSlug: service.slug,
      leadId: appointment.leadId ?? null,
      deepLinkId,
    });
  }

  private async trackPaymentFailed(payment: { appointmentId: string }, failureCategory: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(payment.appointmentId);
    if (!appointment) {
      return;
    }
    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      return;
    }
    await this.trackingService.trackPaymentFailed({
      paymentProvider: PaymentProvider.yookassa,
      failureCategory,
      serviceId: service.id,
      serviceSlug: service.slug,
      leadId: appointment.leadId ?? null,
    });
  }

  private mapFailureCategory(reason?: string | null): string {
    if (!reason) {
      return 'unknown';
    }
    if (reason === 'insufficient_funds') {
      return 'insufficient_funds';
    }
    if (reason === 'timeout') {
      return 'timeout';
    }
    if (reason === 'canceled_by_user') {
      return 'canceled';
    }
    if (reason === 'canceled_by_merchant') {
      return 'provider_error';
    }
    return 'unknown';
  }
}

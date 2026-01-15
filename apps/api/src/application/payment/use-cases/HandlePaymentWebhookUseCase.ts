import { Inject, Injectable } from '@nestjs/common';
import { IPaymentWebhookEventRepository } from '@domain/payment/repositories/IPaymentWebhookEventRepository';
import { ConfirmAppointmentUseCase } from '@application/booking/use-cases/ConfirmAppointmentUseCase';

@Injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    @Inject('IPaymentWebhookEventRepository')
    private readonly webhookEventRepository: IPaymentWebhookEventRepository,
    private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase,
  ) {}

  async execute(payload: any): Promise<{ status: string }> {
    const provider = 'yookassa';
    const providerEventId =
      payload?.event?.id ||
      payload?.id ||
      payload?.object?.id ||
      null;

    if (providerEventId) {
      const isNew = await this.webhookEventRepository.markReceived(provider, providerEventId);
      if (!isNew) {
        return { status: 'duplicate' };
      }
    }

    if (payload?.object?.metadata?.appointment_id) {
      await this.confirmAppointmentUseCase.execute(payload.object.metadata.appointment_id);
    }

    if (providerEventId) {
      await this.webhookEventRepository.markProcessed(provider, providerEventId);
    }

    return { status: 'ok' };
  }
}

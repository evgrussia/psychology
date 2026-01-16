import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../database/prisma.service';
import { IPaymentWebhookEventRepository } from '@domain/payment/repositories/IPaymentWebhookEventRepository';

@Injectable()
export class PrismaPaymentWebhookEventRepository implements IPaymentWebhookEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markReceived(provider: string, providerEventId: string): Promise<boolean> {
    const normalizedProvider = provider === 'yookassa' ? PaymentProvider.yookassa : (provider as PaymentProvider);
    try {
      await this.prisma.paymentWebhookEvent.create({
        data: {
          provider: normalizedProvider,
          provider_event_id: providerEventId,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        return false;
      }
      throw error;
    }
  }

  async markProcessed(provider: string, providerEventId: string): Promise<void> {
    const normalizedProvider = provider === 'yookassa' ? PaymentProvider.yookassa : (provider as PaymentProvider);
    await this.prisma.paymentWebhookEvent.updateMany({
      where: {
        provider: normalizedProvider,
        provider_event_id: providerEventId,
      },
      data: {
        processed_at: new Date(),
      },
    });
  }

  async isProcessed(provider: string, providerEventId: string): Promise<boolean> {
    const normalizedProvider = provider === 'yookassa' ? PaymentProvider.yookassa : (provider as PaymentProvider);
    const record = await this.prisma.paymentWebhookEvent.findUnique({
      where: {
        provider_event_id: providerEventId,
      },
    });
    return !!record?.processed_at;
  }
}

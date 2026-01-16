import { Injectable } from '@nestjs/common';
import { Payment as PrismaPayment, PaymentProvider as PrismaPaymentProvider, PaymentStatus as PrismaPaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { Payment } from '@domain/payment/entities/Payment';
import { IPaymentRepository } from '@domain/payment/repositories/IPaymentRepository';
import { PaymentProvider, PaymentStatus } from '@domain/payment/value-objects/PaymentEnums';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderPaymentId(provider: PaymentProvider, providerPaymentId: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        provider: this.mapProviderToPrisma(provider),
        provider_payment_id: providerPaymentId,
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByIdempotencyKey(provider: PaymentProvider, idempotencyKey: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        provider: this.mapProviderToPrisma(provider),
        idempotency_key: idempotencyKey,
      },
      orderBy: { created_at: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async findLatestByAppointmentId(appointmentId: string): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: { appointment_id: appointmentId },
      orderBy: { created_at: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async create(payment: Payment): Promise<void> {
    await this.prisma.payment.create({
      data: {
        id: payment.id,
        appointment_id: payment.appointmentId,
        provider: this.mapProviderToPrisma(payment.provider),
        provider_payment_id: payment.providerPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: this.mapStatusToPrisma(payment.status),
        failure_category: payment.failureCategory ?? null,
        idempotency_key: payment.idempotencyKey ?? null,
        created_at: payment.createdAt,
        confirmed_at: payment.confirmedAt ?? null,
      },
    });
  }

  async updateStatus(params: {
    provider: PaymentProvider;
    providerPaymentId: string;
    status: PaymentStatus;
    confirmedAt?: Date | null;
    failureCategory?: string | null;
  }): Promise<boolean> {
    const result = await this.prisma.payment.updateMany({
      where: {
        provider: this.mapProviderToPrisma(params.provider),
        provider_payment_id: params.providerPaymentId,
      },
      data: {
        status: this.mapStatusToPrisma(params.status),
        confirmed_at: params.confirmedAt ?? null,
        failure_category: params.failureCategory ?? null,
      },
    });
    return result.count > 0;
  }

  private toDomain(record: PrismaPayment): Payment {
    return Payment.create({
      id: record.id,
      appointmentId: record.appointment_id,
      provider: this.mapProviderToDomain(record.provider),
      providerPaymentId: record.provider_payment_id,
      amount: record.amount,
      currency: record.currency,
      status: this.mapStatusToDomain(record.status),
      failureCategory: record.failure_category,
      idempotencyKey: record.idempotency_key,
      createdAt: record.created_at,
      confirmedAt: record.confirmed_at,
    });
  }

  private mapProviderToPrisma(provider: PaymentProvider): PrismaPaymentProvider {
    switch (provider) {
      case PaymentProvider.yookassa:
        return PrismaPaymentProvider.yookassa;
      default:
        return PrismaPaymentProvider.yookassa;
    }
  }

  private mapProviderToDomain(provider: PrismaPaymentProvider): PaymentProvider {
    switch (provider) {
      case PrismaPaymentProvider.yookassa:
        return PaymentProvider.yookassa;
      default:
        return PaymentProvider.yookassa;
    }
  }

  private mapStatusToPrisma(status: PaymentStatus): PrismaPaymentStatus {
    switch (status) {
      case PaymentStatus.pending:
        return PrismaPaymentStatus.pending;
      case PaymentStatus.succeeded:
        return PrismaPaymentStatus.succeeded;
      case PaymentStatus.canceled:
        return PrismaPaymentStatus.canceled;
      case PaymentStatus.failed:
        return PrismaPaymentStatus.failed;
      default:
        return PrismaPaymentStatus.pending;
    }
  }

  private mapStatusToDomain(status: PrismaPaymentStatus): PaymentStatus {
    switch (status) {
      case PrismaPaymentStatus.pending:
        return PaymentStatus.pending;
      case PrismaPaymentStatus.succeeded:
        return PaymentStatus.succeeded;
      case PrismaPaymentStatus.canceled:
        return PaymentStatus.canceled;
      case PrismaPaymentStatus.failed:
        return PaymentStatus.failed;
      default:
        return PaymentStatus.pending;
    }
  }
}

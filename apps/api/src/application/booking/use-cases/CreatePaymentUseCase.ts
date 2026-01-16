import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IPaymentService } from '@domain/payment/services/IPaymentService';
import { IPaymentRepository } from '@domain/payment/repositories/IPaymentRepository';
import { Payment } from '@domain/payment/entities/Payment';
import { PaymentProvider, PaymentStatus } from '@domain/payment/value-objects/PaymentEnums';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import * as crypto from 'crypto';

export interface CreatePaymentRequestDto {
  appointment_id: string;
  client_request_id?: string;
}

export interface CreatePaymentResponseDto {
  payment_id: string;
  status: string;
  confirmation: {
    confirmation_url?: string;
    url?: string;
  };
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IPaymentService')
    private readonly paymentService: IPaymentService,
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(dto: CreatePaymentRequestDto): Promise<CreatePaymentResponseDto> {
    const appointment = await this.appointmentRepository.findById(dto.appointment_id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const idempotencyKey = dto.client_request_id || null;
    if (idempotencyKey) {
      const existingPayment = await this.paymentRepository.findByIdempotencyKey(PaymentProvider.yookassa, idempotencyKey);
      if (existingPayment && existingPayment.appointmentId === appointment.id) {
        return {
          payment_id: existingPayment.providerPaymentId,
          status: existingPayment.status,
          confirmation: {
            // In case of existing payment, we don't have the confirmation URL easily accessible 
            // without re-querying the provider, but the frontend usually already has it or 
            // we should store it. For now, we return the status and ID.
            // If it's already paid, the frontend will redirect to confirmation.
          },
        };
      }
    }

    const amount = service.depositAmount ?? service.priceAmount;
    if (!amount) {
      throw new BadRequestException('Service has no price');
    }

    const providerResult = await this.paymentService.createPayment({
      appointmentId: appointment.id,
      amount,
      currency: 'RUB',
      description: `Оплата консультации: ${service.title}`,
      idempotencyKey,
    });

    const payment = Payment.create({
      id: crypto.randomUUID(),
      appointmentId: appointment.id,
      provider: PaymentProvider.yookassa,
      providerPaymentId: providerResult.providerPaymentId,
      amount,
      currency: 'RUB',
      status: PaymentStatus.pending,
      idempotencyKey,
      createdAt: new Date(),
    });

    await this.paymentRepository.create(payment);

    await this.trackingService.trackPaymentStarted({
      paymentProvider: PaymentProvider.yookassa,
      amount,
      currency: 'RUB',
      serviceId: service.id,
      serviceSlug: service.slug,
    });

    return {
      payment_id: payment.providerPaymentId,
      status: payment.status,
      confirmation: {
        confirmation_url: providerResult.confirmationUrl,
        url: providerResult.confirmationUrl,
      },
    };
  }
}

import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IPaymentService } from '@domain/payment/services/IPaymentService';
import { ConfirmAppointmentUseCase } from './ConfirmAppointmentUseCase';

export interface CreatePaymentRequestDto {
  appointment_id: string;
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
    private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase,
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

    const amount = service.depositAmount ?? service.priceAmount;
    if (!amount) {
      throw new BadRequestException('Service has no price');
    }

    const payment = await this.paymentService.createPayment({
      appointmentId: appointment.id,
      amount,
      currency: 'RUB',
      description: `Оплата консультации: ${service.title}`,
    });

    // SIMULATION: In a real system, YooKassa would call our webhook POST /api/public/booking/webhook/yookassa.
    // For this implementation phase, we simulate the webhook call after a short delay.
    setTimeout(async () => {
      try {
        await this.confirmAppointmentUseCase.execute(appointment.id);
      } catch (err) {
        console.error('Simulated webhook failed:', err);
      }
    }, 5000);

    return {
      payment_id: payment.id,
      status: payment.status,
      confirmation: {
        confirmation_url: payment.confirmationUrl,
        url: payment.confirmationUrl,
      },
    };
  }
}

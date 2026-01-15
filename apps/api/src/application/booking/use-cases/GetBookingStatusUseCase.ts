import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { BookingStatusResponseDto } from '../dto/booking.dto';

@Injectable()
export class GetBookingStatusUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(appointmentId: string): Promise<BookingStatusResponseDto> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const service = await this.serviceRepository.findById(appointment.serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return {
      appointment_id: appointment.id,
      status: appointment.status,
      service_slug: service.slug,
      format: appointment.format,
      timezone: appointment.timezone,
      start_at_utc: appointment.startAtUtc.toISOString(),
      end_at_utc: appointment.endAtUtc.toISOString(),
    };
  }
}

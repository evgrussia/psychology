import { Inject, Injectable } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { CabinetAppointmentsResponseDto, CabinetAppointmentDto, CabinetAppointmentServiceDto } from '../dto/cabinet.dto';

@Injectable()
export class ListClientAppointmentsUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(clientUserId: string): Promise<CabinetAppointmentsResponseDto> {
    const appointments = await this.appointmentRepository.findByClientUserId(clientUserId);
    const serviceIds = Array.from(new Set(appointments.map((appointment) => appointment.serviceId)));
    const services = await Promise.all(serviceIds.map((id) => this.serviceRepository.findById(id)));
    const serviceMap = new Map<string, CabinetAppointmentServiceDto>();

    services.forEach((service) => {
      if (!service) return;
      serviceMap.set(service.id, {
        id: service.id,
        slug: service.slug,
        title: service.title,
        duration_minutes: service.durationMinutes,
      });
    });

    const now = new Date();

    const toDto = (appointment: typeof appointments[number]): CabinetAppointmentDto => ({
      id: appointment.id,
      start_at_utc: appointment.startAtUtc.toISOString(),
      end_at_utc: appointment.endAtUtc.toISOString(),
      timezone: appointment.timezone,
      format: appointment.format,
      status: appointment.status,
      service: serviceMap.get(appointment.serviceId) ?? null,
    });

    const isUpcoming = (appointment: typeof appointments[number]): boolean => {
      if (appointment.status === AppointmentStatus.canceled || appointment.status === AppointmentStatus.rescheduled) {
        return false;
      }
      return appointment.startAtUtc >= now;
    };

    const upcoming = appointments
      .filter(isUpcoming)
      .sort((a, b) => a.startAtUtc.getTime() - b.startAtUtc.getTime())
      .map(toDto);
    const past = appointments
      .filter((appointment) => !isUpcoming(appointment))
      .sort((a, b) => b.startAtUtc.getTime() - a.startAtUtc.getTime())
      .map(toDto);

    return { upcoming, past };
  }
}

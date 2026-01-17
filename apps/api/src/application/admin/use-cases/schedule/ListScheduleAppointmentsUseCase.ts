import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { ScheduleAppointmentDto } from '../../dto/schedule.dto';

export interface ListScheduleAppointmentsParams {
  from: string;
  to: string;
}

@Injectable()
export class ListScheduleAppointmentsUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(params: ListScheduleAppointmentsParams): Promise<ScheduleAppointmentDto[]> {
    const fromDate = this.parseDate(params.from, 'from');
    const toDate = this.parseDate(params.to, 'to');
    if (fromDate >= toDate) {
      throw new BadRequestException('Invalid date range');
    }

    const appointments = await this.appointmentRepository.findByRange(fromDate, toDate);
    const serviceMap = new Map<string, { slug: string; title: string }>();

    for (const appointment of appointments) {
      if (!serviceMap.has(appointment.serviceId)) {
        const service = await this.serviceRepository.findById(appointment.serviceId);
        serviceMap.set(appointment.serviceId, {
          slug: service?.slug ?? 'unknown',
          title: service?.title ?? 'Unknown service',
        });
      }
    }

    return appointments.map((appointment) => {
      const service = serviceMap.get(appointment.serviceId) || { slug: 'unknown', title: 'Unknown service' };
      return {
        id: appointment.id,
        service_id: appointment.serviceId,
        service_slug: service.slug,
        service_title: service.title,
        start_at_utc: appointment.startAtUtc.toISOString(),
        end_at_utc: appointment.endAtUtc.toISOString(),
        status: appointment.status,
        timezone: appointment.timezone,
      };
    });
  }

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName} date`);
    }
    return date;
  }
}

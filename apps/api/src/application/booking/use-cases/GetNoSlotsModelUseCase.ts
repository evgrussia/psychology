import { Inject, Injectable } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { PreferredContactMethod, PreferredTimeWindow } from '@domain/booking/value-objects/BookingEnums';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { NoSlotsModelDto } from '../dto/no-slots.dto';

@Injectable()
export class GetNoSlotsModelUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(serviceSlug?: string): Promise<NoSlotsModelDto> {
    const service = serviceSlug
      ? await this.serviceRepository.findBySlug(serviceSlug)
      : null;

    const serviceDto = service && service.status === ServiceStatus.published
      ? {
          id: service.id,
          slug: service.slug,
          title: service.title,
        }
      : null;

    return {
      service: serviceDto,
      contact_methods: [
        PreferredContactMethod.email,
        PreferredContactMethod.phone,
        PreferredContactMethod.telegram,
      ],
      time_windows: [
        PreferredTimeWindow.weekday_morning,
        PreferredTimeWindow.weekday_evening,
        PreferredTimeWindow.weekend,
        PreferredTimeWindow.any,
      ],
    };
  }
}

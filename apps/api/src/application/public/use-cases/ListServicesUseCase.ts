import { Inject, Injectable } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { ServiceListItemDto } from '../dto/services.dto';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(): Promise<ServiceListItemDto[]> {
    const services = await this.serviceRepository.findAll(ServiceStatus.published);
    return services.map(service => ({
      id: service.id,
      slug: service.slug,
      title: service.title,
      format: service.format,
      duration_minutes: service.durationMinutes,
      price_amount: service.priceAmount,
      deposit_amount: service.depositAmount ?? null,
      offline_address: service.offlineAddress ?? null,
      description_markdown: service.descriptionMarkdown,
    }));
  }
}

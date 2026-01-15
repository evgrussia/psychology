import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { ServiceDetailsDto } from '../dto/services.dto';

@Injectable()
export class GetServiceBySlugUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(slug: string): Promise<ServiceDetailsDto> {
    const service = await this.serviceRepository.findBySlug(slug);
    if (!service || service.status !== ServiceStatus.published) {
      throw new NotFoundException(`Service with slug "${slug}" not found`);
    }
    return {
      id: service.id,
      slug: service.slug,
      title: service.title,
      format: service.format,
      duration_minutes: service.durationMinutes,
      price_amount: service.priceAmount,
      deposit_amount: service.depositAmount ?? null,
      offline_address: service.offlineAddress ?? null,
      description_markdown: service.descriptionMarkdown,
      cancel_free_hours: service.cancelFreeHours ?? null,
      cancel_partial_hours: service.cancelPartialHours ?? null,
      reschedule_min_hours: service.rescheduleMinHours ?? null,
      reschedule_max_count: service.rescheduleMaxCount ?? null,
    };
  }
}

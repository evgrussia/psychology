import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { Service } from '@domain/booking/entities/Service';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

@Injectable()
export class PublishAdminServiceUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async publish(id: string) {
    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    const props = existing.toObject();
    const updated = Service.create({
      ...props,
      status: ServiceStatus.published,
      updatedAt: new Date(),
    });
    await this.serviceRepository.save(updated);
    return updated.toObject();
  }
}


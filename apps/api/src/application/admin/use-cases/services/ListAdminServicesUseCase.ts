import { Inject, Injectable } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { Service } from '@domain/booking/entities/Service';

@Injectable()
export class ListAdminServicesUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(): Promise<Array<ReturnType<Service['toObject']>>> {
    const services = await this.serviceRepository.findAll();
    return services.map((service) => service.toObject());
  }
}


import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';

@Injectable()
export class GetAdminServiceUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(id: string) {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service.toObject();
  }
}


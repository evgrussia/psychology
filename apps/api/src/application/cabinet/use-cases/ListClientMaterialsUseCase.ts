import { Inject, Injectable } from '@nestjs/common';
import { IAppointmentMaterialRepository } from '@domain/booking/repositories/IAppointmentMaterialRepository';
import { CabinetMaterialsResponseDto } from '../dto/cabinet.dto';

@Injectable()
export class ListClientMaterialsUseCase {
  constructor(
    @Inject('IAppointmentMaterialRepository')
    private readonly appointmentMaterialRepository: IAppointmentMaterialRepository,
  ) {}

  async execute(clientUserId: string): Promise<CabinetMaterialsResponseDto> {
    const materials = await this.appointmentMaterialRepository.findByClientUserId(clientUserId);
    return {
      items: materials.map((material) => ({
        id: material.id,
        appointment_id: material.appointmentId,
        material_type: material.materialType,
        title: material.title,
        description: material.description ?? null,
        url: material.url ?? null,
        created_at: material.createdAt.toISOString(),
      })),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IAppointmentMaterialRepository } from '@domain/booking/repositories/IAppointmentMaterialRepository';
import { AppointmentMaterial } from '@domain/booking/entities/AppointmentMaterial';
import { AppointmentMaterialMapper } from './appointment-material.mapper';

@Injectable()
export class PrismaAppointmentMaterialRepository implements IAppointmentMaterialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientUserId(clientUserId: string): Promise<AppointmentMaterial[]> {
    const records = await this.prisma.appointmentMaterial.findMany({
      where: {
        appointment: {
          client_user_id: clientUserId,
        },
      },
      include: {
        media_asset: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return records.map(AppointmentMaterialMapper.toDomain);
  }
}

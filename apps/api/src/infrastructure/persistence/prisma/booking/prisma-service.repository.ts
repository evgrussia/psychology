import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { Service } from '@domain/booking/entities/Service';
import { ServiceMapper } from './service.mapper';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Service | null> {
    const record = await this.prisma.service.findUnique({
      where: { slug },
    });
    if (!record) return null;
    return ServiceMapper.toDomain(record);
  }

  async findById(id: string): Promise<Service | null> {
    const record = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!record) return null;
    return ServiceMapper.toDomain(record);
  }

  async findAll(status?: ServiceStatus): Promise<Service[]> {
    const records = await this.prisma.service.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'asc' },
    });
    return records.map(ServiceMapper.toDomain);
  }

  async findByTopic(topicCode: string, status?: ServiceStatus): Promise<Service[]> {
    const records = await this.prisma.service.findMany({
      where: {
        topic_code: topicCode,
        status: status ? status : undefined,
      },
      orderBy: { created_at: 'asc' },
    });
    return records.map(ServiceMapper.toDomain);
  }

  async save(service: Service): Promise<void> {
    const data = ServiceMapper.toPrisma(service);
    await this.prisma.service.upsert({
      where: { id: service.id },
      update: data,
      create: data,
    });
  }
}

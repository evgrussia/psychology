import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { Service } from '@domain/booking/entities/Service';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

export interface UpsertAdminServiceDto {
  slug: string;
  title: string;
  descriptionMarkdown: string;
  format: ServiceFormat;
  offlineAddress?: string | null;
  durationMinutes: number;
  priceAmount: number;
  depositAmount?: number | null;
  cancelFreeHours?: number | null;
  cancelPartialHours?: number | null;
  rescheduleMinHours?: number | null;
  rescheduleMaxCount?: number | null;
  status?: ServiceStatus;
  topicCode?: string | null;
}

@Injectable()
export class UpsertAdminServiceUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async create(dto: UpsertAdminServiceDto) {
    const now = new Date();
    const service = Service.create({
      id: randomUUID(),
      slug: dto.slug,
      title: dto.title,
      descriptionMarkdown: dto.descriptionMarkdown,
      format: dto.format,
      offlineAddress: dto.offlineAddress ?? null,
      durationMinutes: dto.durationMinutes,
      priceAmount: dto.priceAmount,
      depositAmount: dto.depositAmount ?? null,
      cancelFreeHours: dto.cancelFreeHours ?? null,
      cancelPartialHours: dto.cancelPartialHours ?? null,
      rescheduleMinHours: dto.rescheduleMinHours ?? null,
      rescheduleMaxCount: dto.rescheduleMaxCount ?? null,
      status: dto.status ?? ServiceStatus.draft,
      topicCode: dto.topicCode ?? null,
      createdAt: now,
      updatedAt: now,
    });
    await this.serviceRepository.save(service);
    return service.toObject();
  }

  async update(id: string, dto: UpsertAdminServiceDto) {
    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    const props = existing.toObject();
    const updated = Service.create({
      ...props,
      slug: dto.slug ?? props.slug,
      title: dto.title ?? props.title,
      descriptionMarkdown: dto.descriptionMarkdown ?? props.descriptionMarkdown,
      format: dto.format ?? props.format,
      offlineAddress: dto.offlineAddress ?? props.offlineAddress ?? null,
      durationMinutes: dto.durationMinutes ?? props.durationMinutes,
      priceAmount: dto.priceAmount ?? props.priceAmount,
      depositAmount: dto.depositAmount ?? props.depositAmount ?? null,
      cancelFreeHours: dto.cancelFreeHours ?? props.cancelFreeHours ?? null,
      cancelPartialHours: dto.cancelPartialHours ?? props.cancelPartialHours ?? null,
      rescheduleMinHours: dto.rescheduleMinHours ?? props.rescheduleMinHours ?? null,
      rescheduleMaxCount: dto.rescheduleMaxCount ?? props.rescheduleMaxCount ?? null,
      status: dto.status ?? props.status,
      topicCode: dto.topicCode ?? props.topicCode ?? null,
      updatedAt: new Date(),
    });
    await this.serviceRepository.save(updated);
    return updated.toObject();
  }
}


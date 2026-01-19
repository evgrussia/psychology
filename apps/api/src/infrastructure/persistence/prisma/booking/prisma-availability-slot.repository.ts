import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { AvailabilitySlotMapper } from './availability-slot.mapper';
import { SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';

@Injectable()
export class PrismaAvailabilitySlotRepository implements IAvailabilitySlotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AvailabilitySlot | null> {
    const record = await this.prisma.availabilitySlot.findUnique({
      where: { id },
    });
    if (!record) {
      return null;
    }
    return AvailabilitySlotMapper.toDomain(record);
  }

  async findAvailableSlots(serviceId: string | null, from: Date, to: Date): Promise<AvailabilitySlot[]> {
    const records = await this.prisma.availabilitySlot.findMany({
      where: {
        status: SlotStatus.available,
        source: SlotSource.product,
        start_at_utc: { gte: from, lt: to },
        end_at_utc: { gt: from, lte: to },
        OR: serviceId ? [{ service_id: serviceId }, { service_id: null }] : [{ service_id: null }],
      },
      orderBy: { start_at_utc: 'asc' },
    });

    return records.map((record) => AvailabilitySlotMapper.toDomain(record));
  }

  async findReservedSlots(from: Date, to: Date): Promise<AvailabilitySlot[]> {
    const records = await this.prisma.availabilitySlot.findMany({
      where: {
        status: SlotStatus.reserved,
        start_at_utc: { lt: to },
        end_at_utc: { gt: from },
      },
      orderBy: { start_at_utc: 'asc' },
    });

    return records.map((record) => AvailabilitySlotMapper.toDomain(record));
  }

  async findBlockedSlots(from: Date, to: Date): Promise<AvailabilitySlot[]> {
    const records = await this.prisma.availabilitySlot.findMany({
      where: {
        status: SlotStatus.blocked,
        source: SlotSource.product,
        start_at_utc: { lt: to },
        end_at_utc: { gt: from },
      },
      orderBy: { start_at_utc: 'asc' },
    });

    return records.map((record) => AvailabilitySlotMapper.toDomain(record));
  }

  async listSlots(
    from: Date,
    to: Date,
    filters?: { serviceId?: string | null; statuses?: string[]; sources?: string[] },
  ): Promise<AvailabilitySlot[]> {
    const records = await this.prisma.availabilitySlot.findMany({
      where: {
        start_at_utc: { lt: to },
        end_at_utc: { gt: from },
        status: filters?.statuses ? { in: filters.statuses as SlotStatus[] } : undefined,
        source: filters?.sources ? { in: filters.sources as SlotSource[] } : undefined,
        OR: filters?.serviceId === undefined
          ? undefined
          : (filters.serviceId ? [{ service_id: filters.serviceId }, { service_id: null }] : [{ service_id: null }]),
      },
      orderBy: { start_at_utc: 'asc' },
    });

    return records.map((record) => AvailabilitySlotMapper.toDomain(record));
  }

  async createSlots(slots: AvailabilitySlot[]): Promise<void> {
    if (slots.length === 0) return;
    const data = slots.map((slot) => ({
      id: slot.id,
      service_id: slot.serviceId,
      start_at_utc: slot.startAtUtc,
      end_at_utc: slot.endAtUtc,
      status: slot.status,
      source: slot.source,
      block_type: slot.blockType ?? null,
      note: slot.note ?? null,
      external_event_id: slot.externalEventId,
      created_at: slot.createdAt,
    }));

    await this.prisma.availabilitySlot.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async updateSlot(slot: AvailabilitySlot): Promise<void> {
    await this.prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: {
        service_id: slot.serviceId,
        start_at_utc: slot.startAtUtc,
        end_at_utc: slot.endAtUtc,
        status: slot.status,
        source: slot.source,
        block_type: slot.blockType ?? null,
        note: slot.note ?? null,
        external_event_id: slot.externalEventId ?? null,
      },
    });
  }

  async deleteSlots(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.prisma.availabilitySlot.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  async reserveSlot(slotId: string): Promise<boolean> {
    const result = await this.prisma.availabilitySlot.updateMany({
      where: { id: slotId, status: SlotStatus.available },
      data: { status: SlotStatus.reserved },
    });

    return result.count > 0;
  }

  async releaseSlot(slotId: string): Promise<boolean> {
    const result = await this.prisma.availabilitySlot.updateMany({
      where: { id: slotId, status: SlotStatus.reserved },
      data: { status: SlotStatus.available },
    });

    return result.count > 0;
  }
}

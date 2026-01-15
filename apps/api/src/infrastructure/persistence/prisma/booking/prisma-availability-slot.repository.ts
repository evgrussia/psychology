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

  async findBusySlots(from: Date, to: Date): Promise<AvailabilitySlot[]> {
    const records = await this.prisma.availabilitySlot.findMany({
      where: {
        status: SlotStatus.blocked,
        source: SlotSource.google_calendar,
        start_at_utc: { lt: to },
        end_at_utc: { gt: from },
      },
      orderBy: { start_at_utc: 'asc' },
    });

    return records.map((record) => AvailabilitySlotMapper.toDomain(record));
  }

  async replaceBusySlots(from: Date, to: Date, busySlots: AvailabilitySlot[]): Promise<void> {
    const data = busySlots.map((slot) => ({
      id: slot.id,
      service_id: slot.serviceId,
      start_at_utc: slot.startAtUtc,
      end_at_utc: slot.endAtUtc,
      status: SlotStatus.blocked,
      source: SlotSource.google_calendar,
      external_event_id: slot.externalEventId,
      created_at: slot.createdAt,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.deleteMany({
        where: {
          source: SlotSource.google_calendar,
          start_at_utc: { lt: to },
          end_at_utc: { gt: from },
        },
      });

      if (data.length > 0) {
        await tx.availabilitySlot.createMany({
          data,
          skipDuplicates: true,
        });
      }
    });
  }

  async reserveSlot(slotId: string): Promise<boolean> {
    const result = await this.prisma.availabilitySlot.updateMany({
      where: { id: slotId, status: SlotStatus.available },
      data: { status: SlotStatus.reserved },
    });

    return result.count > 0;
  }
}

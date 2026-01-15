import { AvailabilitySlot as PrismaAvailabilitySlot, SlotSource as PrismaSlotSource, SlotStatus as PrismaSlotStatus } from '@prisma/client';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';

export class AvailabilitySlotMapper {
  static toDomain(record: PrismaAvailabilitySlot): AvailabilitySlot {
    return AvailabilitySlot.create({
      id: record.id,
      serviceId: record.service_id,
      startAtUtc: record.start_at_utc,
      endAtUtc: record.end_at_utc,
      status: this.mapStatusToDomain(record.status),
      source: this.mapSourceToDomain(record.source),
      externalEventId: record.external_event_id,
      createdAt: record.created_at,
    });
  }

  static toPrisma(slot: AvailabilitySlot): PrismaAvailabilitySlot {
    return {
      id: slot.id,
      service_id: slot.serviceId,
      start_at_utc: slot.startAtUtc,
      end_at_utc: slot.endAtUtc,
      status: this.mapStatusToPrisma(slot.status),
      source: this.mapSourceToPrisma(slot.source),
      external_event_id: slot.externalEventId,
      created_at: slot.createdAt,
    };
  }

  private static mapStatusToDomain(status: PrismaSlotStatus): SlotStatus {
    switch (status) {
      case PrismaSlotStatus.available:
        return SlotStatus.available;
      case PrismaSlotStatus.reserved:
        return SlotStatus.reserved;
      case PrismaSlotStatus.blocked:
        return SlotStatus.blocked;
      default:
        throw new Error(`Unknown SlotStatus: ${status}`);
    }
  }

  private static mapStatusToPrisma(status: SlotStatus): PrismaSlotStatus {
    switch (status) {
      case SlotStatus.available:
        return PrismaSlotStatus.available;
      case SlotStatus.reserved:
        return PrismaSlotStatus.reserved;
      case SlotStatus.blocked:
        return PrismaSlotStatus.blocked;
      default:
        throw new Error(`Unknown SlotStatus: ${status}`);
    }
  }

  private static mapSourceToDomain(source: PrismaSlotSource): SlotSource {
    switch (source) {
      case PrismaSlotSource.product:
        return SlotSource.product;
      case PrismaSlotSource.google_calendar:
        return SlotSource.google_calendar;
      default:
        throw new Error(`Unknown SlotSource: ${source}`);
    }
  }

  private static mapSourceToPrisma(source: SlotSource): PrismaSlotSource {
    switch (source) {
      case SlotSource.product:
        return PrismaSlotSource.product;
      case SlotSource.google_calendar:
        return PrismaSlotSource.google_calendar;
      default:
        throw new Error(`Unknown SlotSource: ${source}`);
    }
  }
}

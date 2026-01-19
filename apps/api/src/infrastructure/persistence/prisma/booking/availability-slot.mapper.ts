import { 
  AvailabilitySlot as PrismaAvailabilitySlot, 
  SlotSource as PrismaSlotSource, 
  SlotStatus as PrismaSlotStatus,
  ScheduleBlockType as PrismaScheduleBlockType
} from '@prisma/client';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { ScheduleBlockType, SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';

export class AvailabilitySlotMapper {
  static toDomain(record: PrismaAvailabilitySlot): AvailabilitySlot {
    return AvailabilitySlot.create({
      id: record.id,
      serviceId: record.service_id,
      startAtUtc: record.start_at_utc,
      endAtUtc: record.end_at_utc,
      status: this.mapStatusToDomain(record.status),
      source: this.mapSourceToDomain(record.source),
      blockType: record.block_type ? this.mapBlockTypeToDomain(record.block_type) : null,
      note: record.note ?? null,
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
      block_type: slot.blockType ? this.mapBlockTypeToPrisma(slot.blockType) : null,
      note: slot.note ?? null,
      external_event_id: slot.externalEventId ?? null,
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
      default:
        throw new Error(`Unknown SlotSource: ${source}`);
    }
  }

  private static mapSourceToPrisma(source: SlotSource): PrismaSlotSource {
    switch (source) {
      case SlotSource.product:
        return PrismaSlotSource.product;
      default:
        throw new Error(`Unknown SlotSource: ${source}`);
    }
  }

  private static mapBlockTypeToDomain(blockType: PrismaScheduleBlockType): ScheduleBlockType {
    switch (blockType) {
      case PrismaScheduleBlockType.exception:
        return ScheduleBlockType.exception;
      case PrismaScheduleBlockType.buffer:
        return ScheduleBlockType.buffer;
      default:
        throw new Error(`Unknown ScheduleBlockType: ${blockType}`);
    }
  }

  private static mapBlockTypeToPrisma(blockType: ScheduleBlockType): PrismaScheduleBlockType {
    switch (blockType) {
      case ScheduleBlockType.exception:
        return PrismaScheduleBlockType.exception;
      case ScheduleBlockType.buffer:
        return PrismaScheduleBlockType.buffer;
      default:
        throw new Error(`Unknown ScheduleBlockType: ${blockType}`);
    }
  }
}

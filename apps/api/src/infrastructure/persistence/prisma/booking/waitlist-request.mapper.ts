import { WaitlistRequest as PrismaWaitlistRequest, WaitlistStatus as PrismaWaitlistStatus } from '@prisma/client';
import { WaitlistRequest } from '@domain/booking/entities/WaitlistRequest';
import { PreferredContactMethod, PreferredTimeWindow, WaitlistStatus } from '@domain/booking/value-objects/BookingEnums';

export class WaitlistRequestMapper {
  static toDomain(record: PrismaWaitlistRequest): WaitlistRequest {
    return WaitlistRequest.create({
      id: record.id,
      userId: record.user_id,
      serviceId: record.service_id,
      preferredContact: record.preferred_contact as PreferredContactMethod,
      contactValueEncrypted: record.contact_value_encrypted,
      preferredTimeWindow: record.preferred_time_window as PreferredTimeWindow | null,
      status: this.mapStatusToDomain(record.status),
      createdAt: record.created_at,
    });
  }

  static toPersistence(entity: WaitlistRequest) {
    return {
      id: entity.id,
      user_id: entity.userId ?? null,
      service_id: entity.serviceId,
      preferred_contact: entity.preferredContact,
      contact_value_encrypted: entity.contactValueEncrypted,
      preferred_time_window: entity.preferredTimeWindow ?? null,
      status: this.mapStatusToPrisma(entity.status),
      created_at: entity.createdAt,
    };
  }

  private static mapStatusToDomain(status: PrismaWaitlistStatus): WaitlistStatus {
    switch (status) {
      case PrismaWaitlistStatus.new:
        return WaitlistStatus.new;
      case PrismaWaitlistStatus.contacted:
        return WaitlistStatus.contacted;
      case PrismaWaitlistStatus.closed:
        return WaitlistStatus.closed;
      default:
        throw new Error(`Unknown WaitlistStatus: ${status}`);
    }
  }

  private static mapStatusToPrisma(status: WaitlistStatus): PrismaWaitlistStatus {
    switch (status) {
      case WaitlistStatus.new:
        return PrismaWaitlistStatus.new;
      case WaitlistStatus.contacted:
        return PrismaWaitlistStatus.contacted;
      case WaitlistStatus.closed:
        return PrismaWaitlistStatus.closed;
      default:
        throw new Error(`Unknown WaitlistStatus: ${status}`);
    }
  }
}

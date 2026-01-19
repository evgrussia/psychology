import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { AuditLogAction } from '@application/audit/dto/audit-log.dto';

export interface DeleteScheduleSlotsAuditContext {
  actorUserId: string | null;
  actorRole: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class DeleteScheduleSlotsUseCase {
  constructor(
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
    @Inject('AuditLogHelper')
    private readonly auditLogHelper: AuditLogHelper,
  ) {}

  async execute(slotIds: string[], audit: DeleteScheduleSlotsAuditContext): Promise<{ deleted: number }> {
    for (const slotId of slotIds) {
      const slot = await this.slotRepository.findById(slotId);
      if (slot && slot.status === SlotStatus.reserved) {
        throw new ConflictException('Cannot delete reserved slot');
      }
    }

    const deleted = await this.slotRepository.deleteSlots(slotIds);

    try {
      await this.auditLogHelper.logAction(
        audit.actorUserId,
        audit.actorRole ?? 'unknown',
        AuditLogAction.ADMIN_SCHEDULE_SLOT_DELETED,
        'AvailabilitySlot',
        null,
        {
          slot_ids: slotIds,
        },
        {
          deleted_count: deleted,
        },
        audit.ipAddress ?? null,
        audit.userAgent ?? null,
      );
    } catch (error) {
      // best-effort logging
    }

    return { deleted };
  }
}

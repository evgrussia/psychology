import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';

@Injectable()
export class DeleteScheduleSlotsUseCase {
  constructor(
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
  ) {}

  async execute(slotIds: string[]): Promise<{ deleted: number }> {
    for (const slotId of slotIds) {
      const slot = await this.slotRepository.findById(slotId);
      if (slot && slot.status === SlotStatus.reserved) {
        throw new ConflictException('Cannot delete reserved slot');
      }
      if (slot && slot.source === SlotSource.google_calendar) {
        throw new ConflictException('Cannot delete calendar slot');
      }
    }

    const deleted = await this.slotRepository.deleteSlots(slotIds);
    return { deleted };
  }
}

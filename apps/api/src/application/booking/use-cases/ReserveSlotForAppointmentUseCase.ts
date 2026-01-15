import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';

@Injectable()
export class ReserveSlotForAppointmentUseCase {
  constructor(
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
  ) {}

  async execute(slotId: string): Promise<void> {
    const reserved = await this.slotRepository.reserveSlot(slotId);
    if (!reserved) {
      throw new ConflictException('Slot is already reserved');
    }
  }
}

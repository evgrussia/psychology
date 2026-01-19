import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { UpdateScheduleSlotRequestDto } from '../../dto/schedule.dto';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { SlotStatus } from '@domain/booking/value-objects/BookingEnums';

@Injectable()
export class UpdateScheduleSlotUseCase {
  constructor(
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
  ) {}

  async execute(slotId: string, dto: UpdateScheduleSlotRequestDto): Promise<void> {
    const slot = await this.slotRepository.findById(slotId);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    if (slot.status === SlotStatus.reserved) {
      throw new ConflictException('Slot is reserved');
    }

    const startAtUtc = this.parseDate(dto.start_at_utc, 'start_at_utc');
    const endAtUtc = this.parseDate(dto.end_at_utc, 'end_at_utc');
    if (startAtUtc >= endAtUtc) {
      throw new BadRequestException('Slot end must be after start');
    }

    const updated = AvailabilitySlot.create({
      id: slot.id,
      serviceId: dto.service_id ?? null,
      startAtUtc,
      endAtUtc,
      status: slot.status,
      source: slot.source,
      blockType: slot.blockType ?? null,
      note: dto.note ?? null,
      externalEventId: slot.externalEventId ?? null,
      createdAt: slot.createdAt,
    });

    await this.slotRepository.updateSlot(updated);
  }

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName} date`);
    }
    return date;
  }
}

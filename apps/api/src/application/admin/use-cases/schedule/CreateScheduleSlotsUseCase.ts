import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { ScheduleBlockType, SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { CreateScheduleSlotsRequestDto } from '../../dto/schedule.dto';

export interface CreateScheduleSlotsParams {
  request: CreateScheduleSlotsRequestDto;
  status: SlotStatus;
  source: SlotSource;
  blockType?: ScheduleBlockType | null;
}

@Injectable()
export class CreateScheduleSlotsUseCase {
  constructor(
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
  ) {}

  async execute(params: CreateScheduleSlotsParams): Promise<{ created: number }> {
    const slots = this.expandSlots(params.request);
    const now = new Date();

    const domainSlots = slots.map((slot) => AvailabilitySlot.create({
      id: randomUUID(),
      serviceId: slot.serviceId ?? null,
      startAtUtc: slot.startAtUtc,
      endAtUtc: slot.endAtUtc,
      status: params.status,
      source: params.source,
      blockType: params.blockType ?? null,
      note: slot.note ?? null,
      externalEventId: null,
      createdAt: now,
    }));

    await this.slotRepository.createSlots(domainSlots);
    return { created: domainSlots.length };
  }

  private expandSlots(request: CreateScheduleSlotsRequestDto): Array<{
    startAtUtc: Date;
    endAtUtc: Date;
    serviceId?: string | null;
    note?: string | null;
  }> {
    const result: Array<{ startAtUtc: Date; endAtUtc: Date; serviceId?: string | null; note?: string | null }> = [];

    for (const slot of request.slots) {
      const startAtUtc = this.parseDate(slot.start_at_utc, 'start_at_utc');
      const endAtUtc = this.parseDate(slot.end_at_utc, 'end_at_utc');
      if (startAtUtc >= endAtUtc) {
        throw new BadRequestException('Slot end must be after start');
      }

      const repeat = slot.repeat;
      if (!repeat || repeat.frequency === 'none') {
        result.push({
          startAtUtc,
          endAtUtc,
          serviceId: slot.service_id ?? null,
          note: slot.note ?? null,
        });
        continue;
      }

      const intervalDays = this.resolveIntervalDays(repeat.frequency, repeat.interval_days);
      if (!repeat.until_at_utc) {
        throw new BadRequestException('Repeat requires until_at_utc');
      }
      const untilAtUtc = this.parseDate(repeat.until_at_utc, 'until_at_utc');
      if (untilAtUtc <= startAtUtc) {
        throw new BadRequestException('Repeat until must be after start');
      }

      let currentStart = new Date(startAtUtc);
      let currentEnd = new Date(endAtUtc);
      while (currentStart < untilAtUtc) {
        result.push({
          startAtUtc: new Date(currentStart),
          endAtUtc: new Date(currentEnd),
          serviceId: slot.service_id ?? null,
          note: slot.note ?? null,
        });
        currentStart = new Date(currentStart.getTime() + intervalDays * 24 * 60 * 60 * 1000);
        currentEnd = new Date(currentEnd.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      }
    }

    return result;
  }

  private resolveIntervalDays(frequency: 'weekly' | 'biweekly' | 'custom', custom?: number): number {
    if (frequency === 'weekly') return 7;
    if (frequency === 'biweekly') return 14;
    if (!custom || custom <= 0) {
      throw new BadRequestException('Custom repeat requires interval_days > 0');
    }
    return custom;
  }

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName} date`);
    }
    return date;
  }
}

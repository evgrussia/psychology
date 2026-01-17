import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { ScheduleSlotDto } from '../../dto/schedule.dto';

export interface ListScheduleSlotsParams {
  from: string;
  to: string;
  serviceId?: string | null;
  statuses?: string[];
  sources?: string[];
}

@Injectable()
export class ListScheduleSlotsUseCase {
  constructor(
    @Inject('IAvailabilitySlotRepository')
    private readonly slotRepository: IAvailabilitySlotRepository,
  ) {}

  async execute(params: ListScheduleSlotsParams): Promise<ScheduleSlotDto[]> {
    const fromDate = this.parseDate(params.from, 'from');
    const toDate = this.parseDate(params.to, 'to');
    if (fromDate >= toDate) {
      throw new BadRequestException('Invalid date range');
    }

    const slots = await this.slotRepository.listSlots(fromDate, toDate, {
      serviceId: params.serviceId,
      statuses: params.statuses,
      sources: params.sources,
    });

    return slots.map((slot) => ({
      id: slot.id,
      service_id: slot.serviceId ?? null,
      start_at_utc: slot.startAtUtc.toISOString(),
      end_at_utc: slot.endAtUtc.toISOString(),
      status: slot.status,
      source: slot.source,
      block_type: slot.blockType ?? null,
      note: slot.note ?? null,
    }));
  }

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName} date`);
    }
    return date;
  }
}

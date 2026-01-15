import { SlotSource, SlotStatus } from '../value-objects/BookingEnums';

export interface AvailabilitySlotProps {
  id: string;
  serviceId?: string | null;
  startAtUtc: Date;
  endAtUtc: Date;
  status: SlotStatus;
  source: SlotSource;
  externalEventId?: string | null;
  createdAt: Date;
}

export class AvailabilitySlot {
  constructor(private readonly props: AvailabilitySlotProps) {}

  get id(): string { return this.props.id; }
  get serviceId(): string | null | undefined { return this.props.serviceId; }
  get startAtUtc(): Date { return this.props.startAtUtc; }
  get endAtUtc(): Date { return this.props.endAtUtc; }
  get status(): SlotStatus { return this.props.status; }
  get source(): SlotSource { return this.props.source; }
  get externalEventId(): string | null | undefined { return this.props.externalEventId; }
  get createdAt(): Date { return this.props.createdAt; }

  static create(props: AvailabilitySlotProps): AvailabilitySlot {
    return new AvailabilitySlot(props);
  }
}

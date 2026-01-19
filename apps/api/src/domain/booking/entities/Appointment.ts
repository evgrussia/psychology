import { AppointmentStatus } from '../value-objects/BookingEnums';
import { ServiceFormat } from '../value-objects/ServiceEnums';

export interface AppointmentProps {
  id: string;
  serviceId: string;
  clientUserId?: string | null;
  leadId?: string | null;
  clientRequestId?: string | null;
  startAtUtc: Date;
  endAtUtc: Date;
  timezone: string;
  format: ServiceFormat;
  status: AppointmentStatus;
  outcome?: string | null;
  outcomeReasonCategory?: string | null;
  outcomeRecordedAt?: Date | null;
  outcomeRecordedByRole?: string | null;
  slotId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Appointment {
  constructor(private readonly props: AppointmentProps) {}

  get id(): string { return this.props.id; }
  get serviceId(): string { return this.props.serviceId; }
  get clientUserId(): string | null | undefined { return this.props.clientUserId; }
  get leadId(): string | null | undefined { return this.props.leadId; }
  get clientRequestId(): string | null | undefined { return this.props.clientRequestId; }
  get startAtUtc(): Date { return this.props.startAtUtc; }
  get endAtUtc(): Date { return this.props.endAtUtc; }
  get timezone(): string { return this.props.timezone; }
  get format(): ServiceFormat { return this.props.format; }
  get status(): AppointmentStatus { return this.props.status; }
  get outcome(): string | null | undefined { return this.props.outcome; }
  get outcomeReasonCategory(): string | null | undefined { return this.props.outcomeReasonCategory; }
  get outcomeRecordedAt(): Date | null | undefined { return this.props.outcomeRecordedAt; }
  get outcomeRecordedByRole(): string | null | undefined { return this.props.outcomeRecordedByRole; }
  get slotId(): string | null | undefined { return this.props.slotId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  static create(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  updateStatus(status: AppointmentStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  recordOutcome(outcome: string, reasonCategory: string | null, recordedByRole: string): void {
    this.props.outcome = outcome;
    this.props.outcomeReasonCategory = reasonCategory ?? null;
    this.props.outcomeRecordedAt = new Date();
    this.props.outcomeRecordedByRole = recordedByRole;
    this.props.updatedAt = new Date();
  }
}

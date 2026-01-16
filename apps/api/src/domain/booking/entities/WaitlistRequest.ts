import { PreferredContactMethod, PreferredTimeWindow, WaitlistStatus } from '../value-objects/BookingEnums';

export interface WaitlistRequestProps {
  id: string;
  userId?: string | null;
  serviceId: string;
  preferredContact: PreferredContactMethod;
  contactValueEncrypted: string;
  preferredTimeWindow?: PreferredTimeWindow | null;
  status: WaitlistStatus;
  createdAt: Date;
}

export class WaitlistRequest {
  constructor(private readonly props: WaitlistRequestProps) {}

  static create(props: WaitlistRequestProps): WaitlistRequest {
    return new WaitlistRequest(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string | null | undefined { return this.props.userId; }
  get serviceId(): string { return this.props.serviceId; }
  get preferredContact(): PreferredContactMethod { return this.props.preferredContact; }
  get contactValueEncrypted(): string { return this.props.contactValueEncrypted; }
  get preferredTimeWindow(): PreferredTimeWindow | null | undefined { return this.props.preferredTimeWindow; }
  get status(): WaitlistStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }

  updateStatus(status: WaitlistStatus): void {
    this.props.status = status;
  }
}

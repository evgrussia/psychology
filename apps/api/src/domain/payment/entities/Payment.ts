import { PaymentProvider, PaymentStatus } from '../value-objects/PaymentEnums';

export interface PaymentProps {
  id: string;
  appointmentId: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureCategory?: string | null;
  idempotencyKey?: string | null;
  createdAt: Date;
  confirmedAt?: Date | null;
}

export class Payment {
  constructor(private readonly props: PaymentProps) {}

  get id(): string { return this.props.id; }
  get appointmentId(): string { return this.props.appointmentId; }
  get provider(): PaymentProvider { return this.props.provider; }
  get providerPaymentId(): string { return this.props.providerPaymentId; }
  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }
  get status(): PaymentStatus { return this.props.status; }
  get failureCategory(): string | null | undefined { return this.props.failureCategory; }
  get idempotencyKey(): string | null | undefined { return this.props.idempotencyKey; }
  get createdAt(): Date { return this.props.createdAt; }
  get confirmedAt(): Date | null | undefined { return this.props.confirmedAt; }

  static create(props: PaymentProps): Payment {
    return new Payment(props);
  }
}

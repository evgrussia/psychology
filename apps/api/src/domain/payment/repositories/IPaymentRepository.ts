import { Payment } from '../entities/Payment';
import { PaymentProvider, PaymentStatus } from '../value-objects/PaymentEnums';

export interface IPaymentRepository {
  findByProviderPaymentId(provider: PaymentProvider, providerPaymentId: string): Promise<Payment | null>;
  findByIdempotencyKey(provider: PaymentProvider, idempotencyKey: string): Promise<Payment | null>;
  findLatestByAppointmentId(appointmentId: string): Promise<Payment | null>;
  create(payment: Payment): Promise<void>;
  updateStatus(params: {
    provider: PaymentProvider;
    providerPaymentId: string;
    status: PaymentStatus;
    confirmedAt?: Date | null;
    failureCategory?: string | null;
  }): Promise<boolean>;
}

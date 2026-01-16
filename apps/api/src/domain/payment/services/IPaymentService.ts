export interface IPaymentService {
  createPayment(params: {
    appointmentId: string;
    amount: number;
    currency: string;
    description: string;
    idempotencyKey?: string | null;
  }): Promise<{
    providerPaymentId: string;
    confirmationUrl?: string;
    status: string;
  }>;
}

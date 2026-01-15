export interface IPaymentService {
  createPayment(params: {
    appointmentId: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<{
    id: string;
    confirmationUrl?: string;
    status: string;
  }>;
}

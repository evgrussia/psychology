import { IPaymentService } from '@domain/payment/services/IPaymentService';

export class YooKassaStub implements IPaymentService {
  async createPayment(params: {
    appointmentId: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<{
    id: string;
    confirmationUrl?: string;
    status: string;
  }> {
    console.log(`Mock: Creating YooKassa payment for ${params.amount} ${params.currency}`, params);
    return {
      id: `mock-payment-${Date.now()}`,
      confirmationUrl: `http://localhost:3000/booking/confirmation?mock_success=true&appointment_id=${params.appointmentId}`,
      status: 'pending',
    };
  }
}

export interface IPaymentService {
  createPayment(amount: number, currency: string): Promise<any>;
}

export class YooKassaStub implements IPaymentService {
  async createPayment(amount: number, currency: string): Promise<any> {
    console.log(`Mock: Creating YooKassa payment for ${amount} ${currency}`);
    return { id: 'mock-payment-id', status: 'pending' };
  }
}

export interface IPaymentWebhookEventRepository {
  markReceived(provider: string, providerEventId: string): Promise<boolean>;
  markProcessed(provider: string, providerEventId: string): Promise<void>;
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IPaymentService } from '@domain/payment/services/IPaymentService';
import { IAlertService } from '@domain/observability/services/IAlertService';

@Injectable()
export class YooKassaService implements IPaymentService {
  private readonly logger = new Logger(YooKassaService.name);
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly apiUrl = 'https://api.yookassa.ru/v3/payments';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject('IAlertService')
    private readonly alertService: IAlertService,
  ) {
    this.shopId = this.configService.get<string>('YOOKASSA_SHOP_ID') || '';
    this.secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY') || '';
  }

  async createPayment(params: {
    appointmentId: string;
    amount: number;
    currency: string;
    description: string;
    idempotencyKey?: string | null;
  }): Promise<{
    providerPaymentId: string;
    confirmationUrl?: string;
    status: string;
  }> {
    if (!this.shopId || !this.secretKey) {
      this.logger.error('YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY not configured. YooKassa integration will fail.');
    }

    const auth = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');
    const idempotencyKey = params.idempotencyKey || `payment-${params.appointmentId}-${Date.now()}`;

    const returnUrl = this.configService.get<string>('YOOKASSA_RETURN_URL') || `http://localhost:3000/booking/confirmation?appointment_id=${params.appointmentId}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            amount: {
              value: params.amount.toFixed(2),
              currency: params.currency,
            },
            confirmation: {
              type: 'redirect',
              return_url: returnUrl,
            },
            capture: true,
            description: params.description,
            metadata: {
              appointmentId: params.appointmentId,
            },
          },
          {
            headers: {
              'Idempotence-Key': idempotencyKey,
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const data = response.data;
      return {
        providerPaymentId: data.id,
        confirmationUrl: data.confirmation?.confirmation_url,
        status: data.status,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorCode = error.response?.data?.code;
      
      this.logger.error(`Failed to create YooKassa payment: ${errorMessage} (${errorCode})`, error.stack);
      
      if (error.response?.data) {
        this.logger.error(`YooKassa error details: ${JSON.stringify(error.response.data)}`);
      }
      await this.alertService.notify({
        key: 'yookassa_payment_create_failed',
        message: 'YooKassa payment creation failed',
        severity: 'critical',
        source: 'payments',
        details: {
          error_code: errorCode ?? 'unknown',
          reason: errorMessage,
        },
      });
      
      throw new Error(`YooKassa Error: ${errorMessage}`);
    }
  }
}

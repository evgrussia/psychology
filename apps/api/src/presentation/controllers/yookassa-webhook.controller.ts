import { Body, Controller, Inject, Logger, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { HandlePaymentWebhookUseCase } from '@application/payment/use-cases/HandlePaymentWebhookUseCase';
import { YooKassaWebhookVerifier } from '@infrastructure/webhooks/yookassa-webhook-verifier';
import { IAlertService } from '@domain/observability/services/IAlertService';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
  requestId?: string;
}

@Controller('webhooks/yookassa')
export class YooKassaWebhookController {
  private readonly logger = new Logger(YooKassaWebhookController.name);

  constructor(
    private readonly handleWebhookUseCase: HandlePaymentWebhookUseCase,
    private readonly webhookVerifier: YooKassaWebhookVerifier,
    @Inject('IAlertService')
    private readonly alertService: IAlertService,
  ) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest, @Body() body: any, @Res() res: Response): Promise<void> {
    const verification = this.webhookVerifier.verify(req);
    if (!verification.ok) {
      this.logger.warn(`Webhook rejected: ${verification.reason ?? 'verification_failed'}`);
      await this.alertService.notify({
        key: 'yookassa_webhook_verification_failed',
        message: 'YooKassa webhook verification failed',
        severity: 'critical',
        source: 'payments',
        details: {
          reason: verification.reason ?? 'verification_failed',
          request_id: req.requestId ?? null,
        },
      });
      res.status(401).json({ status: 'unauthorized' });
      return;
    }

    try {
      const result = await this.handleWebhookUseCase.execute(body);
      if (result.status === 'unknown_payment') {
        res.status(202).json({ status: 'accepted' });
        return;
      }
      res.status(200).json({ status: result.status });
    } catch (error: any) {
      this.logger.error(
        `Webhook processing failed: ${error?.message ?? 'unknown_error'}`,
        error?.stack,
      );
      await this.alertService.notify({
        key: 'yookassa_webhook_processing_failed',
        message: 'YooKassa webhook processing failed',
        severity: 'critical',
        source: 'payments',
        details: {
          request_id: req.requestId ?? null,
          reason: error?.message ?? 'unknown_error',
        },
      });
      res.status(500).json({ status: 'error' });
    }
  }
}

import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { HandlePaymentWebhookUseCase } from '@application/payment/use-cases/HandlePaymentWebhookUseCase';
import { YooKassaWebhookVerifier } from '@infrastructure/webhooks/yookassa-webhook-verifier';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@Controller('webhooks/yookassa')
export class YooKassaWebhookController {
  private readonly logger = new Logger(YooKassaWebhookController.name);

  constructor(
    private readonly handleWebhookUseCase: HandlePaymentWebhookUseCase,
    private readonly webhookVerifier: YooKassaWebhookVerifier,
  ) {}

  @Post()
  async handleWebhook(@Req() req: RawBodyRequest, @Body() body: any, @Res() res: Response): Promise<void> {
    const verification = this.webhookVerifier.verify(req);
    if (!verification.ok) {
      this.logger.warn(`Webhook rejected: ${verification.reason ?? 'verification_failed'}`);
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
      res.status(500).json({ status: 'error' });
    }
  }
}

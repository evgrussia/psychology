import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { HandleTelegramUpdateUseCase } from '@application/telegram/use-cases/HandleTelegramUpdateUseCase';
import { TelegramWebhookVerifier } from '@infrastructure/webhooks/telegram-webhook-verifier';

@Controller('webhooks/telegram')
export class TelegramWebhookController {
  private readonly logger = new Logger(TelegramWebhookController.name);

  constructor(
    private readonly handleUpdateUseCase: HandleTelegramUpdateUseCase,
    private readonly webhookVerifier: TelegramWebhookVerifier,
  ) {}

  @Post()
  async handleWebhook(@Req() req: Request, @Body() body: any, @Res() res: Response): Promise<void> {
    const verification = this.webhookVerifier.verify(req);
    if (!verification.ok) {
      this.logger.warn(`Telegram webhook rejected: ${verification.reason ?? 'verification_failed'}`);
      res.status(401).json({ status: 'unauthorized' });
      return;
    }

    try {
      await this.handleUpdateUseCase.execute(body);
      res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      this.logger.error(
        `Telegram webhook processing failed: ${error?.message ?? 'unknown_error'}`,
        error?.stack,
      );
      res.status(500).json({ status: 'error' });
    }
  }
}

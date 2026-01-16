import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { YooKassaWebhookVerifier } from './yookassa-webhook-verifier';
import { YooKassaWebhookController } from '@presentation/controllers/yookassa-webhook.controller';
import { TelegramWebhookController } from '@presentation/controllers/telegram-webhook.controller';
import { TelegramWebhookVerifier } from './telegram-webhook-verifier';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [BookingModule, TelegramModule],
  controllers: [YooKassaWebhookController, TelegramWebhookController],
  providers: [YooKassaWebhookVerifier, TelegramWebhookVerifier],
})
export class WebhooksModule {}

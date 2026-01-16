import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { YooKassaWebhookVerifier } from './yookassa-webhook-verifier';
import { YooKassaWebhookController } from '@presentation/controllers/yookassa-webhook.controller';

@Module({
  imports: [BookingModule],
  controllers: [YooKassaWebhookController],
  providers: [YooKassaWebhookVerifier],
})
export class WebhooksModule {}

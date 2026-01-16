import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class TelegramWebhookVerifier {
  constructor(private readonly configService: ConfigService) {}

  verify(req: Request): { ok: boolean; reason?: string } {
    const expected = this.configService.get<string>('TELEGRAM_WEBHOOK_SECRET');
    if (!expected) {
      return { ok: true };
    }
    const tokenHeader = req.headers?.['x-telegram-bot-api-secret-token'];
    const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
    if (!token || token !== expected) {
      return { ok: false, reason: 'invalid_secret_token' };
    }
    return { ok: true };
  }
}

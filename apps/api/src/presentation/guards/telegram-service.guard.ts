import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramServiceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const expectedToken = this.configService.get<string>('TELEGRAM_SERVICE_TOKEN');

    if (!expectedToken) {
      throw new UnauthorizedException('Telegram service token is not configured');
    }

    const headerToken = request.headers?.['x-telegram-service-token'];
    const authHeader = request.headers?.['authorization'];
    const bearerToken = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;
    const token = headerToken || bearerToken;

    if (!token || token !== expectedToken) {
      throw new UnauthorizedException('Invalid telegram service token');
    }

    return true;
  }
}

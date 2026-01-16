import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ITelegramUserRepository, TelegramUserUpsertInput } from '@domain/telegram/repositories/ITelegramUserRepository';
import { TelegramUser } from '@domain/telegram/entities/TelegramUser';

@Injectable()
export class PrismaTelegramUserRepository implements ITelegramUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(input: TelegramUserUpsertInput): Promise<TelegramUser> {
    const now = new Date();
    const record = await this.prisma.telegramUser.upsert({
      where: { telegram_user_id: input.telegramUserId },
      update: {
        username: input.username ?? null,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        language_code: input.languageCode ?? null,
        is_bot: input.isBot ?? false,
        last_seen_at: input.lastSeenAt ?? now,
      },
      create: {
        telegram_user_id: input.telegramUserId,
        username: input.username ?? null,
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        language_code: input.languageCode ?? null,
        is_bot: input.isBot ?? false,
        last_seen_at: input.lastSeenAt ?? now,
      },
    });

    return TelegramUser.reconstitute({
      telegramUserId: record.telegram_user_id,
      username: record.username,
      firstName: record.first_name,
      lastName: record.last_name,
      languageCode: record.language_code,
      isBot: record.is_bot,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      lastSeenAt: record.last_seen_at,
    });
  }

  async findById(telegramUserId: string): Promise<TelegramUser | null> {
    const record = await this.prisma.telegramUser.findUnique({
      where: { telegram_user_id: telegramUserId },
    });
    if (!record) return null;
    return TelegramUser.reconstitute({
      telegramUserId: record.telegram_user_id,
      username: record.username,
      firstName: record.first_name,
      lastName: record.last_name,
      languageCode: record.language_code,
      isBot: record.is_bot,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      lastSeenAt: record.last_seen_at,
    });
  }
}

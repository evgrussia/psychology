import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { DeepLink } from '@domain/telegram/entities/DeepLink';
import { TelegramFlow, TelegramTarget, TelegramUtmMedium } from '@domain/telegram/value-objects/TelegramEnums';
import { CreateDeepLinkRequestDto, CreateDeepLinkResponseDto } from '../dto/deep-links.dto';
import { DeepLinkPayloadCodec } from '../services/deep-link-payload-codec';
import * as crypto from 'crypto';

const DEFAULT_TTL_DAYS = 30;
const DEFAULT_BOT_USERNAME = 'psy_balance_bot';

@Injectable()
export class CreateDeepLinkUseCase {
  constructor(
    @Inject('IDeepLinkRepository')
    private readonly deepLinkRepository: IDeepLinkRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateDeepLinkRequestDto): Promise<CreateDeepLinkResponseDto> {
    if (!dto?.tg_flow) {
      throw new BadRequestException('Telegram flow is required');
    }

    const flow = dto.tg_flow;
    if (!Object.values(TelegramFlow).includes(flow)) {
      throw new BadRequestException('Unsupported telegram flow');
    }

    const target = dto.tg_target ?? TelegramTarget.bot;
    if (!Object.values(TelegramTarget).includes(target)) {
      throw new BadRequestException('Unsupported telegram target');
    }

    const now = new Date();
    const ttlDays = this.getTtlDays();
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

    const deepLinkId = this.generateShortId();
    const payload = this.buildPayload({
      deepLinkId,
      flow,
      topic: this.normalizeOptional(dto.topic),
      entityId: this.normalizeOptional(dto.entity_id),
      sourcePage: this.normalizeOptional(dto.source_page),
    });

    const encodedPayload = DeepLinkPayloadCodec.encode(payload);
    const url = this.buildTelegramUrl({
      encodedPayload,
      target,
      utmMedium: this.resolveUtmMedium(dto.utm_medium, target),
      utmCampaign: this.normalizeOptional(dto.utm_campaign) ?? flow,
      utmContent: this.normalizeOptional(dto.utm_content) ?? 'cta',
    });

    const deepLink = DeepLink.create({
      deepLinkId,
      flow,
      target,
      topicCode: payload.t ?? null,
      entityRef: payload.e ?? null,
      sourcePage: payload.s ?? null,
      anonymousId: this.normalizeOptional(dto.anonymous_id),
      leadId: null,
      createdAt: now,
      expiresAt,
    });

    await this.deepLinkRepository.create(deepLink);

    return {
      deep_link_id: deepLinkId,
      url,
    };
  }

  private buildPayload(params: {
    deepLinkId: string;
    flow: TelegramFlow;
    topic?: string | null;
    entityId?: string | null;
    sourcePage?: string | null;
  }) {
    const payload: Record<string, string> = {
      dl: params.deepLinkId,
      f: params.flow,
    };

    if (params.topic) {
      payload.t = params.topic;
    }
    if (params.entityId) {
      payload.e = params.entityId;
    }
    if (params.sourcePage) {
      payload.s = params.sourcePage;
    }

    return payload as {
      dl: string;
      f: TelegramFlow;
      t?: string;
      e?: string;
      s?: string;
    };
  }

  private buildTelegramUrl(params: {
    encodedPayload: string;
    target: TelegramTarget;
    utmMedium: TelegramUtmMedium;
    utmCampaign: string;
    utmContent: string;
  }): string {
    const botUsername = this.configService.get<string>('TELEGRAM_BOT_USERNAME') || DEFAULT_BOT_USERNAME;
    const channelUsername = this.configService.get<string>('TELEGRAM_CHANNEL_USERNAME') || botUsername;
    const base = params.target === TelegramTarget.channel ? channelUsername : botUsername;
    const url = new URL(`https://t.me/${base}`);

    if (params.target === TelegramTarget.bot) {
      url.searchParams.set('start', params.encodedPayload);
    }

    url.searchParams.set('utm_source', 'telegram');
    url.searchParams.set('utm_medium', params.utmMedium);
    url.searchParams.set('utm_campaign', params.utmCampaign);
    url.searchParams.set('utm_content', params.utmContent);

    return url.toString();
  }

  private defaultUtmMedium(target: TelegramTarget): TelegramUtmMedium {
    return target === TelegramTarget.channel ? TelegramUtmMedium.channel : TelegramUtmMedium.bot;
  }

  private resolveUtmMedium(value: TelegramUtmMedium | null | undefined, target: TelegramTarget): TelegramUtmMedium {
    if (!value) {
      return this.defaultUtmMedium(target);
    }
    if (!Object.values(TelegramUtmMedium).includes(value)) {
      return this.defaultUtmMedium(target);
    }
    return value;
  }

  private normalizeOptional(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private getTtlDays(): number {
    const ttl = this.configService.get<number>('TELEGRAM_DEEP_LINK_TTL_DAYS');
    if (!ttl || ttl <= 0) {
      return DEFAULT_TTL_DAYS;
    }
    return ttl;
  }

  private generateShortId(): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.randomBytes(9);
    let result = '';
    for (const byte of bytes) {
      result += alphabet[byte % alphabet.length];
    }
    return result;
  }
}

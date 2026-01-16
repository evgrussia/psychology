import { TelegramFlow, TelegramTarget, TelegramUtmMedium } from '@domain/telegram/value-objects/TelegramEnums';
import { DeepLinkPayload } from '../services/deep-link-payload-codec';

export interface CreateDeepLinkRequestDto {
  tg_flow: TelegramFlow;
  tg_target?: TelegramTarget;
  topic?: string | null;
  entity_id?: string | null;
  source_page?: string | null;
  anonymous_id?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_medium?: TelegramUtmMedium | null;
}

export interface CreateDeepLinkResponseDto {
  deep_link_id: string;
  url: string;
}

export interface ResolveDeepLinkResponseDto {
  payload: DeepLinkPayload;
}

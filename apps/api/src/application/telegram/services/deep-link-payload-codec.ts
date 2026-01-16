import { TelegramFlow } from '@domain/telegram/value-objects/TelegramEnums';

export interface DeepLinkPayload {
  dl: string;
  f: TelegramFlow;
  t?: string;
  e?: string;
  s?: string;
}

export class DeepLinkPayloadCodec {
  static encode(payload: DeepLinkPayload): string {
    const json = JSON.stringify(payload);
    const base64 = Buffer.from(json, 'utf8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  static decode(encoded: string): DeepLinkPayload {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const json = Buffer.from(normalized + padding, 'base64').toString('utf8');
    const payload = JSON.parse(json) as DeepLinkPayload;

    if (!payload?.dl || !payload?.f) {
      throw new Error('Deep link payload is missing required fields');
    }

    return payload;
  }
}

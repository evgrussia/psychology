type TelegramFlow =
  | 'plan_7d'
  | 'save_resource'
  | 'challenge_7d'
  | 'concierge'
  | 'question'
  | 'prep'
  | 'ritual'
  | 'boundaries'
  | 'favorites';

interface BuildTelegramDeepLinkParams {
  deepLinkId: string;
  flow: TelegramFlow;
  topic?: string;
  entityId?: string;
  source?: string;
  utmCampaign?: string;
  utmContent?: string;
}

function base64UrlEncode(value: string): string {
  const base64 = typeof window !== 'undefined'
    ? window.btoa(value)
    : Buffer.from(value, 'utf8').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateDeepLinkId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildTelegramDeepLink(params: BuildTelegramDeepLinkParams): string {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'psy_balance_bot';
  const payload = {
    dl: params.deepLinkId,
    f: params.flow,
    t: params.topic,
    e: params.entityId,
    s: params.source,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const url = new URL(`https://t.me/${botName}`);
  url.searchParams.set('start', encodedPayload);
  url.searchParams.set('utm_source', 'telegram');
  url.searchParams.set('utm_medium', 'bot');
  url.searchParams.set('utm_campaign', params.utmCampaign ?? params.flow);
  url.searchParams.set('utm_content', params.utmContent ?? 'cta');
  return url.toString();
}

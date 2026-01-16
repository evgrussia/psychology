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

type TelegramTarget = 'bot' | 'channel';
type TelegramUtmMedium = 'bot' | 'channel' | 'post' | 'story';

interface BuildTelegramDeepLinkParams {
  deepLinkId: string;
  flow: TelegramFlow;
  topic?: string;
  entityId?: string;
  source?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: TelegramUtmMedium;
  tgTarget?: TelegramTarget;
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
  const channelName = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_USERNAME || botName;
  const target = params.tgTarget ?? 'bot';
  const payload = {
    dl: params.deepLinkId,
    f: params.flow,
    t: params.topic,
    e: params.entityId,
    s: params.source,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const username = target === 'channel' ? channelName : botName;
  const url = new URL(`https://t.me/${username}`);
  if (target === 'bot') {
    url.searchParams.set('start', encodedPayload);
  }
  url.searchParams.set('utm_source', 'telegram');
  url.searchParams.set('utm_medium', params.utmMedium ?? target);
  url.searchParams.set('utm_campaign', params.utmCampaign ?? params.flow);
  url.searchParams.set('utm_content', params.utmContent ?? 'cta');
  return url.toString();
}

export async function createTelegramDeepLink(params: Omit<BuildTelegramDeepLinkParams, 'deepLinkId'>): Promise<{
  deepLinkId: string;
  url: string;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  const anonymousId = typeof window !== 'undefined' ? localStorage.getItem('anonymous_id') : null;

  const response = await fetch(`${apiUrl}/public/deep-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tg_flow: params.flow,
      tg_target: params.tgTarget ?? 'bot',
      topic: params.topic ?? null,
      entity_id: params.entityId ?? null,
      source_page: params.source ?? null,
      anonymous_id: anonymousId,
      utm_campaign: params.utmCampaign ?? null,
      utm_content: params.utmContent ?? null,
      utm_medium: params.utmMedium ?? (params.tgTarget ?? 'bot'),
    }),
  });

  if (!response.ok) {
    throw new Error('Не удалось создать Telegram-ссылку');
  }

  const data = await response.json();
  return {
    deepLinkId: data.deep_link_id,
    url: data.url,
  };
}

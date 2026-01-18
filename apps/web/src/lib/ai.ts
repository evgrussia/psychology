export interface AiNextStepAnswers {
  topic_code?: string;
  intensity: 'acute' | 'background';
  goal: 'relief' | 'clarity' | 'decision';
  time_to_benefit: 'min_1_3' | 'min_7_10' | 'min_20_30' | 'series';
  support_level: 'self_help' | 'micro_support' | 'consultation';
  safety: 'safe' | 'unsafe' | 'not_sure';
}

export interface AiNextStepRequest {
  age_confirmed: boolean;
  consent_sensitive_text: boolean;
  free_text?: string;
  answers: AiNextStepAnswers;
}

export interface AiConciergeAnswers {
  topic_code?: string;
  goal: 'first_meeting' | 'single_session' | 'ongoing_support';
  format_preference: 'online' | 'offline' | 'hybrid' | 'any';
  urgency: 'asap' | 'this_week' | 'flexible';
}

export interface AiConciergeRequest {
  age_confirmed: boolean;
  consent_sensitive_text: boolean;
  free_text?: string;
  answers: AiConciergeAnswers;
}

export interface AiResponseBase {
  status: 'ok' | 'crisis' | 'refused';
  message: string;
  disclaimer: string;
  refusal_reason?: string;
  crisis?: {
    trigger: string;
    actions: Array<{ id: string; label: string; href?: string }>;
  };
}

export interface AiNextStepResponse extends AiResponseBase {
  recommendations?: {
    topic?: { code: string; title: string; href: string };
    articles: Array<{ title: string; href: string }>;
    resources: Array<{ title: string; href: string }>;
  };
  next_steps?: { now: string[]; week: string[] };
  cta?: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}

export interface AiConciergeResponse extends AiResponseBase {
  recommendation?: {
    service?: {
      slug: string;
      title: string;
      href: string;
      format: string;
      duration_minutes: number;
      price_amount: number;
    };
    next_steps: string[];
  };
  handoff?: {
    reason: string;
    actions: Array<{ label: string; href: string }>;
  };
  cta?: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

export async function fetchAiNextStep(payload: AiNextStepRequest): Promise<AiNextStepResponse> {
  const response = await fetch(`${API_BASE}/public/ai/next-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Не удалось получить рекомендации');
  }

  return response.json();
}

export async function fetchAiConcierge(payload: AiConciergeRequest): Promise<AiConciergeResponse> {
  const response = await fetch(`${API_BASE}/public/ai/concierge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Не удалось получить ответ консьержа');
  }

  return response.json();
}

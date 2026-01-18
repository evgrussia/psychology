import {
  AiCrisisTriggerType,
  AiRefusalReason,
  AiSafetyStatus,
  AiSurface,
} from '../value-objects/AiEnums';
import { AiSafetyDecision } from '../value-objects/AiSafetyDecision';

export interface AiSafetyInput {
  surface: AiSurface;
  ageConfirmed: boolean;
  consentSensitive: boolean;
  text?: string | null;
}

const CRISIS_KEYWORDS: Record<AiCrisisTriggerType, string[]> = {
  suicidal_ideation: [
    'суицид',
    'самоубийство',
    'покончить с собой',
    'не хочу жить',
    'умереть',
    'прыгнуть',
    'повеситься',
  ],
  self_harm: [
    'порезать себя',
    'режу себя',
    'резать вены',
    'передозировка',
    'выпил таблетки',
  ],
  violence: [
    'изнасилование',
    'насилие',
    'меня бьёт',
    'угрожает убить',
    'боюсь за жизнь',
  ],
  panic_like: ['паника', 'задыхаюсь', 'страх смерти', 'сердце выпрыгивает'],
  minor_risk: ['не справляюсь', 'очень тяжело', 'безнадёжно', 'одиноко'],
};

const DIAGNOSIS_KEYWORDS = [
  'диагноз',
  'поставь диагноз',
  'какой у меня диагноз',
  'что со мной',
  'психиатрия',
];

const MEDICATION_KEYWORDS = [
  'антидепрессант',
  'таблетки',
  'лекарство',
  'дозировка',
  'назначь',
];

const THERAPY_KEYWORDS = [
  'проведи терапию',
  'психотерапия в чате',
  'лечи меня',
  'разбери мою ситуацию подробно',
];

const includesKeyword = (text: string, keywords: string[]): boolean => {
  const lowered = text.toLowerCase();
  return keywords.some((keyword) => lowered.includes(keyword));
};

const detectCrisisTrigger = (text: string): AiCrisisTriggerType | null => {
  const lowered = text.toLowerCase();
  const highPriority: AiCrisisTriggerType[] = ['suicidal_ideation', 'self_harm', 'violence'];
  for (const category of highPriority) {
    if (CRISIS_KEYWORDS[category].some((keyword) => lowered.includes(keyword))) {
      return category;
    }
  }

  const lowPriority: AiCrisisTriggerType[] = ['panic_like', 'minor_risk'];
  for (const category of lowPriority) {
    if (CRISIS_KEYWORDS[category].some((keyword) => lowered.includes(keyword))) {
      return category;
    }
  }

  return null;
};

export class AiSafetyPolicy {
  evaluate(input: AiSafetyInput): AiSafetyDecision {
    if (!input.ageConfirmed) {
      return { status: 'refuse', refusalReason: 'underage' };
    }

    const text = (input.text || '').trim();
    if (text.length > 0 && !input.consentSensitive) {
      return { status: 'refuse', refusalReason: 'sensitive_without_consent' };
    }

    if (text.length > 0) {
      const crisisTrigger = detectCrisisTrigger(text);
      if (crisisTrigger) {
        return { status: 'crisis', crisisTrigger };
      }

      if (includesKeyword(text, MEDICATION_KEYWORDS)) {
        return { status: 'refuse', refusalReason: 'medication_request' };
      }

      if (includesKeyword(text, DIAGNOSIS_KEYWORDS)) {
        return { status: 'refuse', refusalReason: 'diagnosis_request' };
      }

      if (includesKeyword(text, THERAPY_KEYWORDS)) {
        return { status: 'refuse', refusalReason: 'therapy_request' };
      }
    }

    return { status: 'allow' };
  }

  static refusalToStatus(reason: AiRefusalReason): AiSafetyStatus {
    if (reason === 'underage' || reason === 'sensitive_without_consent') {
      return 'refuse';
    }
    return 'refuse';
  }
}

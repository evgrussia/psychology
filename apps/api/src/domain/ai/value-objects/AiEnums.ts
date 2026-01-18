export type AiSurface = 'next_step' | 'concierge';

export type AiSafetyStatus = 'allow' | 'refuse' | 'crisis';

export type AiRefusalReason =
  | 'underage'
  | 'sensitive_without_consent'
  | 'diagnosis_request'
  | 'medication_request'
  | 'therapy_request'
  | 'out_of_scope';

export type AiCrisisTriggerType =
  | 'suicidal_ideation'
  | 'self_harm'
  | 'violence'
  | 'panic_like'
  | 'minor_risk';

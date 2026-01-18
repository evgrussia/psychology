export type ExperimentStatus = 'active' | 'paused' | 'archived' | 'draft';

export interface ExperimentVariantDefinition {
  key: string;
  label: string;
  weight: number;
}

export interface ExperimentDefinition {
  id: string;
  name: string;
  status: ExperimentStatus;
  surface: string;
  primaryMetricEvent: string;
  guardrailEvents: string[];
  variants: ExperimentVariantDefinition[];
  enabledEnvironments?: Array<'dev' | 'stage' | 'prod'>;
}

const defaultVariants: ExperimentVariantDefinition[] = [
  { key: 'A', label: 'Контроль', weight: 0.5 },
  { key: 'B', label: 'Вариант', weight: 0.5 },
];

const experiments: ExperimentDefinition[] = [
  {
    id: 'EXP-HP-CTA-01',
    name: 'Primary CTA Telegram vs Booking',
    status: 'active',
    surface: 'home_hero',
    primaryMetricEvent: 'cta_tg_click',
    guardrailEvents: ['booking_start', 'tg_series_stopped'],
    variants: defaultVariants,
    enabledEnvironments: ['dev', 'stage'],
  },
  {
    id: 'EXP-HP-TTB-01',
    name: 'Time-to-benefit block order',
    status: 'draft',
    surface: 'home_first_step',
    primaryMetricEvent: 'first_step_started',
    guardrailEvents: ['booking_start', 'faq_opened'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-LND-TRUST-01',
    name: 'Trust strip on topic landing',
    status: 'draft',
    surface: 'topic_landing',
    primaryMetricEvent: 'booking_start',
    guardrailEvents: ['cta_tg_click'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-ART-CTA-01',
    name: 'CTA placement on article',
    status: 'draft',
    surface: 'article',
    primaryMetricEvent: 'cta_tg_click',
    guardrailEvents: ['booking_start', 'tg_series_stopped'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-QZ-INTRO-01',
    name: 'Quiz intro copy',
    status: 'draft',
    surface: 'quiz_intro',
    primaryMetricEvent: 'complete_quiz',
    guardrailEvents: ['crisis_banner_shown'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-QZ-RES-CTA-01',
    name: 'Quiz result CTA emphasis',
    status: 'draft',
    surface: 'quiz_result',
    primaryMetricEvent: 'cta_tg_click',
    guardrailEvents: ['booking_start', 'tg_series_stopped'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-NAV-LEN-01',
    name: 'Navigator length',
    status: 'draft',
    surface: 'navigator',
    primaryMetricEvent: 'navigator_complete',
    guardrailEvents: ['booking_start'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-PRP-BOOK-01',
    name: 'Consultation prep to booking CTA',
    status: 'draft',
    surface: 'consultation_prep',
    primaryMetricEvent: 'booking_start',
    guardrailEvents: ['consultation_prep_exported'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-BKG-SUMMARY-01',
    name: 'Payment summary clarity',
    status: 'draft',
    surface: 'booking_payment',
    primaryMetricEvent: 'booking_paid',
    guardrailEvents: ['payment_failed'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-BKG-NOSLOTS-01',
    name: 'No-slots primary CTA',
    status: 'draft',
    surface: 'booking_no_slots',
    primaryMetricEvent: 'waitlist_submitted',
    guardrailEvents: ['tg_series_stopped'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-PAY-ERR-01',
    name: 'Payment error recovery',
    status: 'draft',
    surface: 'payment_error',
    primaryMetricEvent: 'booking_paid',
    guardrailEvents: ['payment_failed'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-TG-ONB-01',
    name: 'Telegram onboarding order',
    status: 'draft',
    surface: 'telegram_onboarding',
    primaryMetricEvent: 'tg_onboarding_completed',
    guardrailEvents: ['tg_series_stopped'],
    variants: defaultVariants,
  },
  {
    id: 'EXP-TG-REM-01',
    name: 'Telegram reminder opt-in',
    status: 'draft',
    surface: 'telegram_reminder',
    primaryMetricEvent: 'tg_interaction',
    guardrailEvents: ['tg_series_stopped'],
    variants: defaultVariants,
  },
];

export function getExperimentCatalog(environment: 'dev' | 'stage' | 'prod' = resolveEnvironment()): ExperimentDefinition[] {
  return experiments.map((experiment) => ({
    ...experiment,
    status: isExperimentEnabled(experiment, environment) ? experiment.status : 'paused',
  }));
}

export function getExperimentById(
  experimentId: string,
  environment: 'dev' | 'stage' | 'prod' = resolveEnvironment(),
): ExperimentDefinition | null {
  const experiment = experiments.find((item) => item.id === experimentId) ?? null;
  if (!experiment) return null;
  if (!isExperimentEnabled(experiment, environment)) {
    return { ...experiment, status: 'paused' };
  }
  return experiment;
}

function resolveEnvironment(): 'dev' | 'stage' | 'prod' {
  if (process.env.NODE_ENV === 'production') return 'prod';
  if (process.env.NODE_ENV === 'test') return 'stage';
  return 'dev';
}

function isExperimentEnabled(experiment: ExperimentDefinition, environment: 'dev' | 'stage' | 'prod'): boolean {
  if (!experiment.enabledEnvironments || experiment.enabledEnvironments.length === 0) {
    return true;
  }
  return experiment.enabledEnvironments.includes(environment);
}

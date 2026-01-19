import { ResultLevel } from '../value-objects/ResultLevel';

export interface QuizQuestionOption {
  value: number;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizQuestionOption[];
}

export interface QuizThreshold {
  level: ResultLevel;
  minScore: number;
  maxScore: number;
}

export interface QuizResultRecommendation {
  now: string[];
  week: string[];
  whenToSeekHelp?: string;
}

export interface QuizResult {
  level: ResultLevel;
  title: string;
  description: string;
  recommendations: QuizResultRecommendation;
  ctaText?: string;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  thresholds: QuizThreshold[];
  results: QuizResult[];
  crisisTrigger?: {
    questionId?: string;
    thresholdScore?: number;
  };
}

export interface NavigatorChoice {
  choice_id: string;
  text: string;
  next_step_id: string | null; // null if it leads to a result
  result_profile_id?: string;  // if next_step_id is null, this should be present
  crisis_trigger?: boolean;
  crisis_trigger_type?: 'self_harm' | 'suicidal_ideation' | 'violence' | 'minor_risk' | 'panic_like';
}

export interface NavigatorStep {
  step_id: string;
  question_text: string;
  choices: NavigatorChoice[];
  crisis_trigger?: boolean;
}

export interface NavigatorResultProfile {
  id: string;
  title: string;
  description: string;
  recommendations: {
    articles?: string[];
    exercises?: string[];
    resources?: string[];
  };
  cta?: {
    text: string;
    link: string;
  };
}

export interface NavigatorConfig {
  initial_step_id: string;
  steps: NavigatorStep[];
  result_profiles: NavigatorResultProfile[];
}

export interface BoundaryScriptVariant {
  variant_id: string;
  text: string;
}

export interface BoundaryScriptScenario {
  id: string;
  name: string;
  description?: string;
  is_unsafe?: boolean;
}

export interface BoundaryScriptTone {
  id: string;
  name: string;
}

export interface BoundaryScriptGoal {
  id: string;
  name: string;
}

export interface BoundaryScriptMatrixItem {
  scenario_id: string;
  tone_id: string;
  goal_id: string;
  variants: BoundaryScriptVariant[];
}

export interface BoundariesConfig {
  scenarios: BoundaryScriptScenario[];
  tones: BoundaryScriptTone[];
  goals: BoundaryScriptGoal[];
  matrix: BoundaryScriptMatrixItem[];
  safety_block: {
    text: string;
  };
}

export interface RitualStep {
  id: string;
  title: string;
  content: string; // markdown
  durationSeconds?: number;
}

export interface RitualConfig {
  why: string;
  steps: RitualStep[];
  totalDurationSeconds?: number;
  audioMediaAssetId?: string;
}

export type ThermometerScaleId = 'energy' | 'tension' | 'support';

export interface ThermometerScale {
  id: ThermometerScaleId;
  title: string;
  description?: string;
  minLabel?: string;
  maxLabel?: string;
  minValue?: number; // default 0
  maxValue?: number; // default 10
}

export interface ThermometerThreshold {
  level: ResultLevel;
  minScore: number;
  maxScore: number;
}

export interface ThermometerResult {
  level: ResultLevel;
  title: string;
  description: string;
  recommendations: {
    now: string[];
    nextDays?: string[];
    whenToSeekHelp?: string;
  };
  ctaText?: string;
}

/**
 * "Resource thermometer" — short check-in.
 * The frontend computes an aggregate score (0..N) from answers and maps it via thresholds.
 * No free text is required.
 */
export interface ThermometerConfig {
  intro?: string;
  scales: ThermometerScale[];
  thresholds: ThermometerThreshold[];
  results: ThermometerResult[];
}

export interface PrepStepOption {
  id: string;
  text: string;
}

export interface PrepStep {
  id: string;
  title: string;
  description?: string;
  options: PrepStepOption[];
  /** Optional prompt for a local-only note (not persisted by default). */
  optionalNoteLabel?: string;
}

export interface PrepResult {
  title: string;
  description?: string;
  checklist: string[];
  ctaText?: string;
}

/**
 * "Preparation for the first consultation" — wizard 5–7 steps.
 * Free text is optional and should be treated as local-only unless explicitly saved elsewhere.
 */
export interface PrepConfig {
  intro?: string;
  steps: PrepStep[];
  result: PrepResult;
}

export type InteractiveConfig =
  | QuizConfig
  | NavigatorConfig
  | BoundariesConfig
  | RitualConfig
  | ThermometerConfig
  | PrepConfig;

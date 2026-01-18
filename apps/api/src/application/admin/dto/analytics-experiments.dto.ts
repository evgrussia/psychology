export interface ExperimentVariantStatsDto {
  key: string;
  label: string;
  exposures: number;
  conversions: number;
  conversion_rate: number | null;
}

export interface ExperimentResultDto {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived' | 'draft';
  surface: string;
  primary_metric_event: string;
  guardrail_events: string[];
  variants: ExperimentVariantStatsDto[];
}

export interface ExperimentResultsResponseDto {
  range: { preset: string; from: string; to: string; label: string };
  experiments: ExperimentResultDto[];
}

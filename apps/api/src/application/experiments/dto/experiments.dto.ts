export interface ExperimentAssignmentRequestDto {
  experiment_id: string;
  anonymous_id?: string | null;
  user_id?: string | null;
}

export interface ExperimentAssignmentResponseDto {
  experiment_id: string;
  variant: string | null;
  assigned_at: string | null;
  expires_at: string | null;
  is_new: boolean;
  status: 'active' | 'paused' | 'archived' | 'draft';
  surface: string | null;
}

export interface ExperimentListItemDto {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived' | 'draft';
  surface: string;
  primary_metric_event: string;
  guardrail_events: string[];
  variants: { key: string; label: string; weight: number }[];
}

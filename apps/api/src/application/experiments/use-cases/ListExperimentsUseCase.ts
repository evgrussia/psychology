import { Injectable } from '@nestjs/common';
import { ExperimentListItemDto } from '../dto/experiments.dto';
import { getExperimentCatalog } from '../experiments-catalog';

@Injectable()
export class ListExperimentsUseCase {
  execute(): ExperimentListItemDto[] {
    return getExperimentCatalog().map((experiment) => ({
      id: experiment.id,
      name: experiment.name,
      status: experiment.status,
      surface: experiment.surface,
      primary_metric_event: experiment.primaryMetricEvent,
      guardrail_events: experiment.guardrailEvents,
      variants: experiment.variants.map((variant) => ({
        key: variant.key,
        label: variant.label,
        weight: variant.weight,
      })),
    }));
  }
}

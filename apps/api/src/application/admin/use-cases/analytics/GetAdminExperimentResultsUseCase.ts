import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AnalyticsCacheService } from '../../../../infrastructure/common/analytics-cache.service';
import { AnalyticsRangeQuery, resolveAnalyticsRange } from './analytics-range';
import { getExperimentCatalog } from '../../../experiments/experiments-catalog';
import { ExperimentResultsResponseDto } from '../../dto/analytics-experiments.dto';

const CACHE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class GetAdminExperimentResultsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute(
    query: AnalyticsRangeQuery = {},
    experimentId?: string,
  ): Promise<ExperimentResultsResponseDto> {
    const range = resolveAnalyticsRange(query);
    const cacheKey = this.buildCacheKey(range, experimentId);
    const cached = this.cache.get<ExperimentResultsResponseDto>(cacheKey);
    if (cached) return cached;

    const catalog = getExperimentCatalog();
    const experiments = experimentId
      ? catalog.filter((experiment) => experiment.id === experimentId)
      : catalog;

    const results = await Promise.all(
      experiments.map(async (experiment) => {
        const exposureRows = await this.prisma.$queryRaw<
          { variant: string; count: bigint | number }[]
        >`
          SELECT e.properties->>'variant' AS variant, COUNT(*) AS count
          FROM analytics_events e
          WHERE e.event_name = 'experiment_exposed'
            AND e.occurred_at >= ${range.from}
            AND e.occurred_at <= ${range.to}
            AND e.properties->>'experiment_id' = ${experiment.id}
          GROUP BY e.properties->>'variant';
        `;

        const conversionRows = await this.prisma.$queryRaw<
          { variant: string; count: bigint | number }[]
        >`
          SELECT e.properties->>'variant' AS variant, COUNT(*) AS count
          FROM analytics_events e
          WHERE e.event_name = ${experiment.primaryMetricEvent}
            AND e.occurred_at >= ${range.from}
            AND e.occurred_at <= ${range.to}
            AND e.properties->>'experiment_id' = ${experiment.id}
          GROUP BY e.properties->>'variant';
        `;

        const exposures = new Map(exposureRows.map((row) => [row.variant, this.toNumber(row.count)]));
        const conversions = new Map(conversionRows.map((row) => [row.variant, this.toNumber(row.count)]));

        const variants = experiment.variants.map((variant) => {
          const exposureCount = exposures.get(variant.key) ?? 0;
          const conversionCount = conversions.get(variant.key) ?? 0;
          return {
            key: variant.key,
            label: variant.label,
            exposures: exposureCount,
            conversions: conversionCount,
            conversion_rate: exposureCount > 0 ? conversionCount / exposureCount : null,
          };
        });

        return {
          id: experiment.id,
          name: experiment.name,
          status: experiment.status,
          surface: experiment.surface,
          primary_metric_event: experiment.primaryMetricEvent,
          guardrail_events: experiment.guardrailEvents,
          variants,
        };
      }),
    );

    const response: ExperimentResultsResponseDto = {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      experiments: results,
    };

    this.cache.set(cacheKey, response, CACHE_TTL_MS);
    return response;
  }

  private buildCacheKey(range: { preset: string; from: Date; to: Date }, experimentId?: string): string {
    return `admin-analytics:experiments:${experimentId ?? 'all'}:${range.preset}:${range.from.toISOString()}:${range.to.toISOString()}`;
  }

  private toNumber(value: bigint | number | null | undefined): number {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return 0;
  }
}

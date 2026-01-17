import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AnalyticsCacheService } from '../../../../infrastructure/common/analytics-cache.service';
import { AnalyticsFilters, buildAnalyticsFilters } from './analytics-filters';
import { AnalyticsRangeQuery, resolveAnalyticsRange } from './analytics-range';

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface AdminInteractiveFunnelResponse {
  range: { preset: string; from: string; to: string; label: string };
  steps: { step: 'start' | 'complete' | 'cta_or_booking'; count: number }[];
  conversion: { from: string; to: string; rate: number | null }[];
}

@Injectable()
export class GetAdminInteractiveFunnelUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute(
    query: AnalyticsRangeQuery = {},
    filters: AnalyticsFilters = {},
  ): Promise<AdminInteractiveFunnelResponse> {
    const range = resolveAnalyticsRange(query);
    const cacheKey = this.buildCacheKey('interactive', range, filters);
    const cached = this.cache.get<AdminInteractiveFunnelResponse>(cacheKey);
    if (cached) return cached;

    const startEvents = ['start_quiz', 'navigator_start', 'resource_thermometer_start'];
    const completeEvents = ['complete_quiz', 'navigator_complete', 'resource_thermometer_complete'];
    const ctaEvents = ['cta_tg_click', 'booking_start'];

    const baseConditions: Prisma.Sql[] = [
      Prisma.sql`e.occurred_at >= ${range.from}`,
      Prisma.sql`e.occurred_at <= ${range.to}`,
    ];
    const scopedFilters = { ...filters, tgFlow: undefined };
    baseConditions.push(
      ...buildAnalyticsFilters(scopedFilters, { eventAlias: 'e', leadAlias: 'l', includeLeadTopic: true }),
    );
    const baseWhere = Prisma.join(baseConditions, ' AND ');

    const [startRows, completeRows, ctaRows] = await Promise.all([
      this.prisma.$queryRaw<{ count: bigint | number }[]>`
        SELECT COUNT(DISTINCT e.lead_id) AS count
        FROM lead_timeline_events e
        JOIN leads l ON l.id = e.lead_id
        WHERE ${baseWhere} AND e.event_name IN (${Prisma.join(startEvents)});
      `,
      this.prisma.$queryRaw<{ count: bigint | number }[]>`
        SELECT COUNT(DISTINCT e.lead_id) AS count
        FROM lead_timeline_events e
        JOIN leads l ON l.id = e.lead_id
        WHERE ${baseWhere} AND e.event_name IN (${Prisma.join(completeEvents)});
      `,
      this.prisma.$queryRaw<{ count: bigint | number }[]>`
        SELECT COUNT(DISTINCT e.lead_id) AS count
        FROM lead_timeline_events e
        JOIN leads l ON l.id = e.lead_id
        WHERE ${baseWhere} AND e.event_name IN (${Prisma.join(ctaEvents)});
      `,
    ]);

    const startCount = this.toNumber(startRows[0]?.count);
    const completeCount = this.toNumber(completeRows[0]?.count);
    const ctaCount = this.toNumber(ctaRows[0]?.count);

    const steps: { step: 'start' | 'complete' | 'cta_or_booking'; count: number }[] = [
      { step: 'start', count: startCount },
      { step: 'complete', count: completeCount },
      { step: 'cta_or_booking', count: ctaCount },
    ];

    const conversion = [
      { from: 'start', to: 'complete', fromCount: startCount, toCount: completeCount },
      { from: 'complete', to: 'cta_or_booking', fromCount: completeCount, toCount: ctaCount },
    ].map((pair) => ({
      from: pair.from,
      to: pair.to,
      rate: pair.fromCount > 0 ? pair.toCount / pair.fromCount : null,
    }));

    const response: AdminInteractiveFunnelResponse = {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      steps,
      conversion,
    };

    this.cache.set(cacheKey, response, CACHE_TTL_MS);
    return response;
  }

  private buildCacheKey(
    scope: string,
    range: { preset: string; from: Date; to: Date },
    filters: AnalyticsFilters,
  ): string {
    return `admin-analytics:${scope}:${range.preset}:${range.from.toISOString()}:${range.to.toISOString()}:${filters.topic ?? ''}:${filters.serviceSlug ?? ''}:${filters.tgFlow ?? ''}`;
  }

  private toNumber(value: bigint | number | null | undefined): number {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return 0;
  }
}

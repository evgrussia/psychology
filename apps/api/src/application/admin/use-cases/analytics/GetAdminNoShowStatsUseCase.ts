import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AnalyticsCacheService } from '../../../../infrastructure/common/analytics-cache.service';
import { AnalyticsFilters, buildAnalyticsFilters } from './analytics-filters';
import { AnalyticsRangeQuery, resolveAnalyticsRange } from './analytics-range';

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface AdminNoShowStatsResponse {
  range: { preset: string; from: string; to: string; label: string };
  totalCount: number;
  noShowCount: number;
  noShowRate: number | null;
}

@Injectable()
export class GetAdminNoShowStatsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute(
    query: AnalyticsRangeQuery = {},
    filters: AnalyticsFilters = {},
  ): Promise<AdminNoShowStatsResponse> {
    const range = resolveAnalyticsRange(query);
    const cacheKey = this.buildCacheKey('no-show', range, filters);
    const cached = this.cache.get<AdminNoShowStatsResponse>(cacheKey);
    if (cached) return cached;

    const conditions: Prisma.Sql[] = [
      Prisma.sql`e.event_name = 'appointment_outcome_recorded'`,
      Prisma.sql`e.occurred_at >= ${range.from}`,
      Prisma.sql`e.occurred_at <= ${range.to}`,
    ];
    const scopedFilters = { ...filters, tgFlow: undefined };
    conditions.push(
      ...buildAnalyticsFilters(scopedFilters, { eventAlias: 'e', leadAlias: 'l', includeLeadTopic: true }),
    );
    const whereSql = Prisma.join(conditions, ' AND ');

    const rows = await this.prisma.$queryRaw<
      { no_show_count: bigint | number | null; total_count: bigint | number | null }[]
    >`
      SELECT
        COUNT(*) FILTER (WHERE e.properties->>'outcome' = 'no_show') AS no_show_count,
        COUNT(*) AS total_count
      FROM lead_timeline_events e
      JOIN leads l ON l.id = e.lead_id
      WHERE ${whereSql};
    `;

    const noShowCount = this.toNumber(rows[0]?.no_show_count);
    const totalCount = this.toNumber(rows[0]?.total_count);

    const response: AdminNoShowStatsResponse = {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      totalCount,
      noShowCount,
      noShowRate: totalCount > 0 ? noShowCount / totalCount : null,
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

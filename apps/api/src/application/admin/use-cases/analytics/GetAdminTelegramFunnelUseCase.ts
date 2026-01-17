import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AnalyticsCacheService } from '../../../../infrastructure/common/analytics-cache.service';
import { AnalyticsFilters, buildAnalyticsFilters } from './analytics-filters';
import { AnalyticsRangeQuery, resolveAnalyticsRange } from './analytics-range';

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface AdminTelegramFunnelResponse {
  range: { preset: string; from: string; to: string; label: string };
  steps: { event: string; count: number }[];
  conversion: { from: string; to: string; rate: number | null }[];
}

@Injectable()
export class GetAdminTelegramFunnelUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute(
    query: AnalyticsRangeQuery = {},
    filters: AnalyticsFilters = {},
  ): Promise<AdminTelegramFunnelResponse> {
    const range = resolveAnalyticsRange(query);
    const cacheKey = this.buildCacheKey('telegram', range, filters);
    const cached = this.cache.get<AdminTelegramFunnelResponse>(cacheKey);
    if (cached) return cached;

    const steps = ['cta_tg_click', 'tg_subscribe_confirmed', 'tg_onboarding_completed'];
    const conditions: Prisma.Sql[] = [
      Prisma.sql`e.event_name IN (${Prisma.join(steps)})`,
      Prisma.sql`e.occurred_at >= ${range.from}`,
      Prisma.sql`e.occurred_at <= ${range.to}`,
    ];
    conditions.push(
      ...buildAnalyticsFilters(filters, { eventAlias: 'e', leadAlias: 'l', includeLeadTopic: true }),
    );

    const whereSql = Prisma.join(conditions, ' AND ');

    const rows = await this.prisma.$queryRaw<
      { event_name: string; count: bigint | number }[]
    >`
      SELECT e.event_name, COUNT(DISTINCT COALESCE(e.deep_link_id, e.lead_id::text)) AS count
      FROM lead_timeline_events e
      JOIN leads l ON l.id = e.lead_id
      WHERE ${whereSql}
      GROUP BY e.event_name;
    `;

    const counts = steps.map((event) => {
      const match = rows.find((row) => row.event_name === event);
      return { event, count: this.toNumber(match?.count) };
    });

    const conversion = [
      { from: 'cta_tg_click', to: 'tg_subscribe_confirmed' },
      { from: 'tg_subscribe_confirmed', to: 'tg_onboarding_completed' },
    ].map((pair) => {
      const fromCount = counts.find((c) => c.event === pair.from)?.count ?? 0;
      const toCount = counts.find((c) => c.event === pair.to)?.count ?? 0;
      return {
        from: pair.from,
        to: pair.to,
        rate: fromCount > 0 ? toCount / fromCount : null,
      };
    });

    const response: AdminTelegramFunnelResponse = {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      steps: counts,
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

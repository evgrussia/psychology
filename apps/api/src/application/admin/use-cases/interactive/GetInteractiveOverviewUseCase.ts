import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AnalyticsCacheService } from '../../../../infrastructure/common/analytics-cache.service';

const CACHE_TTL_MS = 10 * 60 * 1000;
const DAYS_RANGE = 30;

export interface InteractiveOverviewItem {
  id: string;
  type: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: Date | null;
  starts: number;
  completes: number;
  completionRate: number | null;
}

@Injectable()
export class GetInteractiveOverviewUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute() {
    const to = new Date();
    const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() - (DAYS_RANGE - 1)));
    const cacheKey = `interactive-overview-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}`;
    const cached = this.cache.get<{ range: { from: string; to: string; label: string }; items: InteractiveOverviewItem[] }>(cacheKey);
    if (cached) return cached;

    const definitions = await this.prisma.interactiveDefinition.findMany({
      orderBy: { title: 'asc' },
    });

    const starts = await this.prisma.interactiveRun.groupBy({
      by: ['interactive_definition_id'],
      _count: { _all: true },
      where: {
        started_at: { gte: from },
      },
    });

    const completes = await this.prisma.interactiveRun.groupBy({
      by: ['interactive_definition_id'],
      _count: { _all: true },
      where: {
        started_at: { gte: from },
        completed_at: { not: null },
      },
    });

    const startsMap = new Map(starts.map((row) => [row.interactive_definition_id, Number(row._count._all)]));
    const completesMap = new Map(completes.map((row) => [row.interactive_definition_id, Number(row._count._all)]));

    const items = definitions.map((definition) => {
      const startCount = startsMap.get(definition.id) ?? 0;
      const completeCount = completesMap.get(definition.id) ?? 0;
      return {
        id: definition.id,
        type: definition.interactive_type,
        slug: definition.slug,
        title: definition.title,
        status: definition.status,
        publishedAt: definition.published_at,
        starts: startCount,
        completes: completeCount,
        completionRate: startCount ? Math.round((completeCount / startCount) * 1000) / 10 : null,
      };
    });

    const response = {
      range: {
        from: from.toISOString(),
        to: to.toISOString(),
        label: `last_${DAYS_RANGE}_days`,
      },
      items,
    };

    this.cache.set(cacheKey, response, CACHE_TTL_MS);
    return response;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

type DashboardRangePreset = 'today' | '7d' | '30d' | 'custom';

export interface AdminDashboardQuery {
  range?: string;
  from?: string;
  to?: string;
}

export interface AdminDashboardResponse {
  range: {
    preset: DashboardRangePreset;
    from: string;
    to: string;
    label: string;
  };
  bookingFunnel: {
    steps: { event: string; count: number }[];
    conversion: { from: string; to: string; rate: number | null }[];
  };
  telegram: {
    newSubscriptions: number;
    activeUsers: number;
    stoppedCount: number;
    startedCount: number;
    stopRate: number | null;
  };
  interactive: {
    items: {
      id: string;
      title: string;
      type: string;
      starts: number;
      completions: number;
      completionRate: number | null;
    }[];
  };
  meetings: {
    upcoming: {
      id: string;
      startAt: string;
      serviceTitle: string;
      format: string;
    }[];
    completedCount: number;
    noShowCount: number;
    outcomeCount: number;
    noShowRate: number | null;
  };
  moderation: {
    pendingCount: number;
    flaggedCount: number;
    averageModerationHours: number | null;
    alert: { type: 'pending_overdue' | 'slow_moderation'; message: string } | null;
  };
  revenue: {
    gmv: number;
    currency: string;
    aov: number | null;
    previousGmv: number;
    changePct: number | null;
  };
}

@Injectable()
export class GetAdminDashboardUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: AdminDashboardQuery = {}): Promise<AdminDashboardResponse> {
    const range = this.resolveRange(query);
    const previousRange = this.shiftRange(range);

    const [
      bookingFunnel,
      telegram,
      interactive,
      meetings,
      moderation,
      revenue,
    ] = await Promise.all([
      this.getBookingFunnel(range.from, range.to),
      this.getTelegramStats(range.from, range.to),
      this.getInteractiveStats(range.from, range.to),
      this.getMeetingStats(range.from, range.to),
      this.getModerationStats(range.from, range.to),
      this.getRevenueStats(range.from, range.to, previousRange.from, previousRange.to),
    ]);

    return {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      bookingFunnel,
      telegram,
      interactive,
      meetings,
      moderation,
      revenue,
    };
  }

  private resolveRange(query: AdminDashboardQuery): {
    preset: DashboardRangePreset;
    from: Date;
    to: Date;
    label: string;
  } {
    const now = new Date();
    const preset = this.normalizePreset(query.range);

    if (preset === 'custom') {
      const from = this.parseDate(query.from, 'start');
      const to = this.parseDate(query.to, 'end');
      if (from && to && from <= to) {
        return {
          preset,
          from,
          to,
          label: `custom ${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`,
        };
      }
    }

    if (preset === 'today') {
      const from = this.startOfUtcDay(now);
      return {
        preset,
        from,
        to: now,
        label: 'today',
      };
    }

    const days = preset === '30d' ? 30 : 7;
    const from = this.startOfUtcDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
    return {
      preset: preset === 'custom' ? '7d' : preset,
      from,
      to: now,
      label: preset === '30d' ? 'last_30_days' : 'last_7_days',
    };
  }

  private shiftRange(range: { from: Date; to: Date }): { from: Date; to: Date } {
    const duration = range.to.getTime() - range.from.getTime();
    return {
      from: new Date(range.from.getTime() - duration),
      to: new Date(range.from.getTime()),
    };
  }

  private normalizePreset(preset?: string): DashboardRangePreset {
    if (preset === 'today' || preset === '7d' || preset === '30d' || preset === 'custom') {
      return preset;
    }
    return '7d';
  }

  private parseDate(value?: string, bound?: 'start' | 'end'): Date | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    if (bound === 'start') {
      return this.startOfUtcDay(date);
    }
    if (bound === 'end') {
      return this.endOfUtcDay(date);
    }
    return date;
  }

  private startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  }

  private endOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  }

  private async getBookingFunnel(from: Date, to: Date): Promise<AdminDashboardResponse['bookingFunnel']> {
    const steps = [
      'booking_start',
      'booking_slot_selected',
      'booking_paid',
      'booking_confirmed',
    ];

    const grouped = await (this.prisma.leadTimelineEvent as any).groupBy({
      by: ['event_name'],
      where: {
        event_name: { in: steps },
        occurred_at: { gte: from, lte: to },
      },
      _count: { _all: true },
    });

    const counts = steps.map((event) => {
      const match = (grouped as any[]).find((row) => row.event_name === event);
      return { event, count: match?._count?._all ?? 0 };
    });

    const conversion = [
      { from: 'booking_start', to: 'booking_slot_selected' },
      { from: 'booking_slot_selected', to: 'booking_paid' },
      { from: 'booking_paid', to: 'booking_confirmed' },
    ].map((pair) => {
      const fromCount = counts.find((c) => c.event === pair.from)?.count ?? 0;
      const toCount = counts.find((c) => c.event === pair.to)?.count ?? 0;
      return {
        from: pair.from,
        to: pair.to,
        rate: fromCount > 0 ? toCount / fromCount : null,
      };
    });

    return { steps: counts, conversion };
  }

  private async getTelegramStats(from: Date, to: Date): Promise<AdminDashboardResponse['telegram']> {
    const [newSubscriptions, activeUsersGrouped, stoppedCount, startedCount] = await Promise.all([
      this.prisma.leadTimelineEvent.count({
        where: { event_name: 'tg_subscribe_confirmed', occurred_at: { gte: from, lte: to } },
      }),
      (this.prisma.telegramSession as any).groupBy({
        by: ['telegram_user_id'],
        where: { last_interaction_at: { gte: from, lte: to } },
      }),
      this.prisma.telegramSession.count({
        where: { stopped_at: { gte: from, lte: to } },
      }),
      this.prisma.telegramSession.count({
        where: { started_at: { gte: from, lte: to } },
      }),
    ]);

    return {
      newSubscriptions,
      activeUsers: (activeUsersGrouped as any[]).length,
      stoppedCount,
      startedCount,
      stopRate: startedCount > 0 ? stoppedCount / startedCount : null,
    };
  }

  private async getInteractiveStats(from: Date, to: Date): Promise<AdminDashboardResponse['interactive']> {
    const grouped = await (this.prisma.interactiveRun as any).groupBy({
      by: ['interactive_definition_id'],
      where: { started_at: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: {
        _count: {
          interactive_definition_id: 'desc',
        },
      },
      take: 3,
    });

    const ids = (grouped as any[]).map((row) => row.interactive_definition_id);
    if (ids.length === 0) {
      return { items: [] };
    }

    const [definitions, completionGrouped] = await Promise.all([
      this.prisma.interactiveDefinition.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, interactive_type: true },
      }),
      (this.prisma.interactiveRun as any).groupBy({
        by: ['interactive_definition_id'],
        where: {
          interactive_definition_id: { in: ids },
          completed_at: { gte: from, lte: to },
        },
        _count: { _all: true },
      }),
    ]);

    const completionMap = new Map<string, number>();
    (completionGrouped as any[]).forEach((row) => completionMap.set(row.interactive_definition_id, row._count._all));

    const items = (grouped as any[]).map((row) => {
      const definition = definitions.find((def) => def.id === row.interactive_definition_id);
      const completions = completionMap.get(row.interactive_definition_id) ?? 0;
      const starts = row._count._all;
      return {
        id: row.interactive_definition_id,
        title: definition?.title ?? 'Interactive',
        type: definition?.interactive_type ?? 'unknown',
        starts,
        completions,
        completionRate: starts > 0 ? completions / starts : null,
      };
    });

    return { items };
  }

  private async getMeetingStats(from: Date, to: Date): Promise<AdminDashboardResponse['meetings']> {
    const now = new Date();
    const [upcoming, completedCount, outcomeCounts] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          start_at_utc: { gte: now },
          status: { in: ['confirmed', 'paid', 'pending_payment'] },
        },
        orderBy: { start_at_utc: 'asc' },
        take: 5,
        select: {
          id: true,
          start_at_utc: true,
          format: true,
          service: { select: { title: true } },
        },
      }),
      this.prisma.appointment.count({
        where: { status: 'completed', start_at_utc: { gte: from, lte: to } },
      }),
      this.prisma.$queryRaw<
        { no_show_count: bigint | number | null; total_count: bigint | number | null }[]
      >`
        SELECT
          COUNT(*) FILTER (WHERE properties->>'outcome' = 'no_show') AS no_show_count,
          COUNT(*) AS total_count
        FROM lead_timeline_events
        WHERE event_name = 'appointment_outcome_recorded'
          AND occurred_at >= ${from}
          AND occurred_at <= ${to};
      `,
    ]);

    const noShowCount = this.toNumber(outcomeCounts[0]?.no_show_count);
    const outcomeCount = this.toNumber(outcomeCounts[0]?.total_count);

    return {
      upcoming: upcoming.map((appointment) => ({
        id: appointment.id,
        startAt: appointment.start_at_utc.toISOString(),
        serviceTitle: appointment.service.title,
        format: appointment.format,
      })),
      completedCount,
      noShowCount,
      outcomeCount,
      noShowRate: outcomeCount > 0 ? noShowCount / outcomeCount : null,
    };
  }

  private async getModerationStats(from: Date, to: Date): Promise<AdminDashboardResponse['moderation']> {
    const overdueThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [pendingCount, flaggedCount, avgRows, overdueRows] = await Promise.all([
      this.prisma.anonymousQuestion.count({ where: { status: 'pending' } }),
      this.prisma.anonymousQuestion.count({ where: { status: 'flagged' } }),
      this.prisma.$queryRaw<{ avg_hours: number | null }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (a.created_at - q.submitted_at))) / 3600 AS avg_hours
        FROM ugc_moderation_actions a
        JOIN anonymous_questions q ON q.id = a.ugc_id
        WHERE a.ugc_type = 'anonymous_question'
          AND a.created_at >= ${from}
          AND a.created_at <= ${to};
      `,
      this.prisma.$queryRaw<{ overdue_count: bigint | number }[]>`
        SELECT COUNT(*) AS overdue_count
        FROM anonymous_questions
        WHERE status IN ('pending', 'flagged')
          AND submitted_at < ${overdueThreshold};
      `,
    ]);

    const averageModerationHours = avgRows[0]?.avg_hours ?? null;
    const overdueCount = this.toNumber(overdueRows[0]?.overdue_count);

    let alert: AdminDashboardResponse['moderation']['alert'] = null;
    if (overdueCount > 0) {
      alert = {
        type: 'pending_overdue',
        message: `Есть ${overdueCount} вопросов в очереди более 24 часов.`,
      };
    } else if (averageModerationHours !== null && averageModerationHours > 24) {
      alert = {
        type: 'slow_moderation',
        message: 'Среднее время модерации превышает 24 часа.',
      };
    }

    return {
      pendingCount,
      flaggedCount,
      averageModerationHours,
      alert,
    };
  }

  private async getRevenueStats(
    from: Date,
    to: Date,
    prevFrom: Date,
    prevTo: Date,
  ): Promise<AdminDashboardResponse['revenue']> {
    const [currentAgg, prevAgg] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          status: 'succeeded',
          confirmed_at: { gte: from, lte: to },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'succeeded',
          confirmed_at: { gte: prevFrom, lte: prevTo },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    const gmv = currentAgg._sum.amount ?? 0;
    const count = currentAgg._count._all ?? 0;
    const previousGmv = prevAgg._sum.amount ?? 0;

    return {
      gmv,
      currency: 'RUB',
      aov: count > 0 ? gmv / count : null,
      previousGmv,
      changePct: previousGmv > 0 ? (gmv - previousGmv) / previousGmv : null,
    };
  }

  private toNumber(value: bigint | number | null | undefined): number {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return 0;
  }
}

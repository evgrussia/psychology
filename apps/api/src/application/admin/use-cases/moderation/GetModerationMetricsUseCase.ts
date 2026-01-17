import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { resolveAnalyticsRange } from '../analytics/analytics-range';
import { ModerationMetricsQueryDto, ModerationMetricsResponseDto } from '../../dto/moderation.dto';

@Injectable()
export class GetModerationMetricsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ModerationMetricsQueryDto = {}): Promise<ModerationMetricsResponseDto> {
    const range = resolveAnalyticsRange(query);
    const crisisFlag = ['crisis'];
    const now = new Date();
    const overdueThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const crisisThreshold = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    const [
      totalSubmitted,
      rejectedCount,
      crisisCount,
      answeredCount,
      pendingCount,
      flaggedCount,
      overdueRows,
      crisisOverdueRows,
      decisionAvgRows,
      answerAvgRows,
    ] = await Promise.all([
      this.prisma.anonymousQuestion.count({
        where: { submitted_at: { gte: range.from, lte: range.to } },
      }),
      this.prisma.anonymousQuestion.count({
        where: { status: 'rejected', submitted_at: { gte: range.from, lte: range.to } },
      }),
      this.prisma.anonymousQuestion.count({
        where: {
          submitted_at: { gte: range.from, lte: range.to },
          trigger_flags: { array_contains: crisisFlag as any },
        },
      }),
      this.prisma.anonymousQuestion.count({
        where: { submitted_at: { gte: range.from, lte: range.to }, answered_at: { not: null } },
      }),
      this.prisma.anonymousQuestion.count({ where: { status: 'pending' } }),
      this.prisma.anonymousQuestion.count({ where: { status: 'flagged' } }),
      this.prisma.$queryRaw<{ overdue_count: bigint | number | null }[]>`
        SELECT COUNT(*) AS overdue_count
        FROM anonymous_questions
        WHERE status IN ('pending', 'flagged')
          AND submitted_at < ${overdueThreshold};
      `,
      this.prisma.$queryRaw<{ overdue_count: bigint | number | null }[]>`
        SELECT COUNT(*) AS overdue_count
        FROM anonymous_questions
        WHERE status IN ('pending', 'flagged')
          AND submitted_at < ${crisisThreshold}
          AND trigger_flags @> ${JSON.stringify(crisisFlag)}::jsonb;
      `,
      this.prisma.$queryRaw<{ avg_hours: number | null }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (a.first_action_at - q.submitted_at))) / 3600 AS avg_hours
        FROM (
          SELECT ugc_id, MIN(created_at) AS first_action_at
          FROM ugc_moderation_actions
          WHERE ugc_type = 'anonymous_question'
            AND action IN ('approve', 'reject', 'escalate')
          GROUP BY ugc_id
        ) a
        JOIN anonymous_questions q ON q.id = a.ugc_id
        WHERE q.submitted_at >= ${range.from}
          AND q.submitted_at <= ${range.to};
      `,
      this.prisma.$queryRaw<{ avg_hours: number | null }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (answered_at - submitted_at))) / 3600 AS avg_hours
        FROM anonymous_questions
        WHERE answered_at IS NOT NULL
          AND submitted_at >= ${range.from}
          AND submitted_at <= ${range.to};
      `,
    ]);

    const averageDecisionHours = decisionAvgRows[0]?.avg_hours ?? null;
    const averageAnswerHours = answerAvgRows[0]?.avg_hours ?? null;
    const overdueCount = this.toNumber(overdueRows[0]?.overdue_count);
    const crisisOverdueCount = this.toNumber(crisisOverdueRows[0]?.overdue_count);

    const alerts: ModerationMetricsResponseDto['alerts'] = [];
    if (pendingCount + flaggedCount > 10) {
      alerts.push({
        type: 'queue_overflow',
        message: 'Очередь модерации превышает 10 вопросов.',
      });
    }
    if (crisisOverdueCount > 0) {
      alerts.push({
        type: 'crisis_overdue',
        message: `Есть ${crisisOverdueCount} кризисных вопросов без решения более 4 часов.`,
      });
    }
    if (averageDecisionHours !== null && averageDecisionHours > 24) {
      alerts.push({
        type: 'slow_moderation',
        message: 'Среднее время модерации превышает 24 часа.',
      });
    }

    return {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      queue: {
        pendingCount,
        flaggedCount,
        overdueCount,
        crisisOverdueCount,
      },
      sla: {
        averageDecisionHours,
        averageAnswerHours,
      },
      ratios: {
        rejectedShare: totalSubmitted > 0 ? rejectedCount / totalSubmitted : null,
        crisisShare: totalSubmitted > 0 ? crisisCount / totalSubmitted : null,
      },
      totals: {
        submittedCount: totalSubmitted,
        rejectedCount,
        crisisCount,
        answeredCount,
      },
      alerts,
    };
  }

  private toNumber(value: bigint | number | null | undefined): number {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return 0;
  }
}

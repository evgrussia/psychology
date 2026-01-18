import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AnalyticsCacheService } from '../../../../infrastructure/common/analytics-cache.service';
import { AnalyticsRangeQuery, resolveAnalyticsRange } from './analytics-range';
import { AnalyticsFilters, buildAnalyticsFilters } from './analytics-filters';

const CACHE_TTL_MS = 10 * 60 * 1000;

interface QuizQuestionRow {
  quiz_slug: string | null;
  question_index: number | null;
  count: bigint | number;
}

interface QuizAbandonedRow {
  quiz_slug: string | null;
  abandoned_at_question: number | null;
  count: bigint | number;
}

interface QuizSummaryRow {
  quiz_slug: string | null;
  count: bigint | number;
}

interface NavigatorChoiceRow {
  navigator_slug: string | null;
  step_index: number | null;
  choice_id: string | null;
  count: bigint | number;
}

export interface AdminInteractiveDetailsResponse {
  range: { preset: string; from: string; to: string; label: string };
  quizzes: {
    quiz_slug: string;
    starts: number;
    completes: number;
    completion_rate: number | null;
    questions: { question_index: number; count: number }[];
    abandonments: { abandoned_at_question: number; count: number }[];
  }[];
  navigators: {
    navigator_slug: string;
    steps: {
      step_index: number;
      total: number;
      choices: { choice_id: string; count: number; rate: number | null }[];
    }[];
  }[];
}

@Injectable()
export class GetAdminInteractiveDetailsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService,
  ) {}

  async execute(
    query: AnalyticsRangeQuery = {},
    filters: AnalyticsFilters = {},
  ): Promise<AdminInteractiveDetailsResponse> {
    const range = resolveAnalyticsRange(query);
    const cacheKey = this.buildCacheKey('interactive-details', range, filters);
    const cached = this.cache.get<AdminInteractiveDetailsResponse>(cacheKey);
    if (cached) return cached;

    const baseConditions: Prisma.Sql[] = [
      Prisma.sql`e.occurred_at >= ${range.from}`,
      Prisma.sql`e.occurred_at <= ${range.to}`,
    ];
    const scopedFilters = { ...filters, serviceSlug: undefined, tgFlow: undefined };
    baseConditions.push(
      ...buildAnalyticsFilters(scopedFilters, { eventAlias: 'e', includeLeadTopic: false }),
    );
    const baseWhere = Prisma.join(baseConditions, ' AND ');

    const runKey = Prisma.sql`COALESCE(NULLIF(e.properties->>'run_id',''), e.event_id)`;

    const [
      quizStartRows,
      quizCompleteRows,
      quizQuestionRows,
      quizAbandonedRows,
      navigatorChoiceRows,
    ] = await Promise.all([
      this.prisma.$queryRaw<QuizSummaryRow[]>`
        SELECT e.properties->>'quiz_slug' AS quiz_slug,
               COUNT(DISTINCT ${runKey}) AS count
        FROM analytics_events e
        WHERE ${baseWhere} AND e.event_name = 'start_quiz'
        GROUP BY e.properties->>'quiz_slug';
      `,
      this.prisma.$queryRaw<QuizSummaryRow[]>`
        SELECT e.properties->>'quiz_slug' AS quiz_slug,
               COUNT(DISTINCT ${runKey}) AS count
        FROM analytics_events e
        WHERE ${baseWhere} AND e.event_name = 'complete_quiz'
        GROUP BY e.properties->>'quiz_slug';
      `,
      this.prisma.$queryRaw<QuizQuestionRow[]>`
        SELECT e.properties->>'quiz_slug' AS quiz_slug,
               (e.properties->>'question_index')::int AS question_index,
               COUNT(DISTINCT ${runKey}) AS count
        FROM analytics_events e
        WHERE ${baseWhere}
          AND e.event_name = 'quiz_question_completed'
          AND e.properties ? 'question_index'
        GROUP BY e.properties->>'quiz_slug', (e.properties->>'question_index')::int;
      `,
      this.prisma.$queryRaw<QuizAbandonedRow[]>`
        SELECT e.properties->>'quiz_slug' AS quiz_slug,
               (e.properties->>'abandoned_at_question')::int AS abandoned_at_question,
               COUNT(DISTINCT ${runKey}) AS count
        FROM analytics_events e
        WHERE ${baseWhere}
          AND e.event_name = 'quiz_abandoned'
          AND e.properties ? 'abandoned_at_question'
        GROUP BY e.properties->>'quiz_slug', (e.properties->>'abandoned_at_question')::int;
      `,
      this.prisma.$queryRaw<NavigatorChoiceRow[]>`
        SELECT e.properties->>'navigator_slug' AS navigator_slug,
               (e.properties->>'step_index')::int AS step_index,
               e.properties->>'choice_id' AS choice_id,
               COUNT(DISTINCT ${runKey}) AS count
        FROM analytics_events e
        WHERE ${baseWhere}
          AND e.event_name = 'navigator_step_completed'
          AND e.properties ? 'step_index'
        GROUP BY e.properties->>'navigator_slug',
                 (e.properties->>'step_index')::int,
                 e.properties->>'choice_id';
      `,
    ]);

    const quizStarts = this.mapCounts(quizStartRows);
    const quizCompletes = this.mapCounts(quizCompleteRows);
    const quizQuestions = this.mapQuestionCounts(quizQuestionRows);
    const quizAbandonments = this.mapAbandonments(quizAbandonedRows);

    const quizzes = this.buildQuizDetails(quizStarts, quizCompletes, quizQuestions, quizAbandonments);
    const navigators = this.buildNavigatorDetails(navigatorChoiceRows);

    const response: AdminInteractiveDetailsResponse = {
      range: {
        preset: range.preset,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
      },
      quizzes,
      navigators,
    };

    this.cache.set(cacheKey, response, CACHE_TTL_MS);
    return response;
  }

  private buildCacheKey(
    scope: string,
    range: { preset: string; from: Date; to: Date },
    filters: AnalyticsFilters,
  ): string {
    return `admin-analytics:${scope}:${range.preset}:${range.from.toISOString()}:${range.to.toISOString()}:${filters.topic ?? ''}`;
  }

  private mapCounts(rows: QuizSummaryRow[]): Map<string, number> {
    const map = new Map<string, number>();
    rows.forEach((row) => {
      if (!row.quiz_slug) return;
      map.set(row.quiz_slug, this.toNumber(row.count));
    });
    return map;
  }

  private mapQuestionCounts(rows: QuizQuestionRow[]): Map<string, { question_index: number; count: number }[]> {
    const map = new Map<string, { question_index: number; count: number }[]>();
    rows.forEach((row) => {
      if (!row.quiz_slug || row.question_index === null) return;
      const entry = map.get(row.quiz_slug) ?? [];
      entry.push({ question_index: row.question_index, count: this.toNumber(row.count) });
      map.set(row.quiz_slug, entry);
    });
    map.forEach((entries) => entries.sort((a, b) => a.question_index - b.question_index));
    return map;
  }

  private mapAbandonments(rows: QuizAbandonedRow[]): Map<string, { abandoned_at_question: number; count: number }[]> {
    const map = new Map<string, { abandoned_at_question: number; count: number }[]>();
    rows.forEach((row) => {
      if (!row.quiz_slug || row.abandoned_at_question === null) return;
      const entry = map.get(row.quiz_slug) ?? [];
      entry.push({ abandoned_at_question: row.abandoned_at_question, count: this.toNumber(row.count) });
      map.set(row.quiz_slug, entry);
    });
    map.forEach((entries) => entries.sort((a, b) => a.abandoned_at_question - b.abandoned_at_question));
    return map;
  }

  private buildQuizDetails(
    starts: Map<string, number>,
    completes: Map<string, number>,
    questions: Map<string, { question_index: number; count: number }[]>,
    abandonments: Map<string, { abandoned_at_question: number; count: number }[]>,
  ): AdminInteractiveDetailsResponse['quizzes'] {
    const slugs = new Set<string>([
      ...starts.keys(),
      ...completes.keys(),
      ...questions.keys(),
      ...abandonments.keys(),
    ]);

    return Array.from(slugs)
      .sort()
      .map((slug) => {
        const startCount = starts.get(slug) ?? 0;
        const completeCount = completes.get(slug) ?? 0;
        return {
          quiz_slug: slug,
          starts: startCount,
          completes: completeCount,
          completion_rate: startCount > 0 ? completeCount / startCount : null,
          questions: questions.get(slug) ?? [],
          abandonments: abandonments.get(slug) ?? [],
        };
      });
  }

  private buildNavigatorDetails(rows: NavigatorChoiceRow[]): AdminInteractiveDetailsResponse['navigators'] {
    const map = new Map<string, Map<number, Map<string, number>>>();

    rows.forEach((row) => {
      if (!row.navigator_slug || row.step_index === null || !row.choice_id) return;
      const navigator = map.get(row.navigator_slug) ?? new Map<number, Map<string, number>>();
      const step = navigator.get(row.step_index) ?? new Map<string, number>();
      step.set(row.choice_id, this.toNumber(row.count));
      navigator.set(row.step_index, step);
      map.set(row.navigator_slug, navigator);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slug, stepsMap]) => {
        const steps = Array.from(stepsMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([stepIndex, choicesMap]) => {
            const choices = Array.from(choicesMap.entries())
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([choiceId, count]) => ({ choice_id: choiceId, count }));
            const total = choices.reduce((sum, item) => sum + item.count, 0);
            const choicesWithRate = choices.map((choice) => ({
              ...choice,
              rate: total > 0 ? choice.count / total : null,
            }));
            return {
              step_index: stepIndex,
              total,
              choices: choicesWithRate,
            };
          });
        return { navigator_slug: slug, steps };
      });
  }

  private toNumber(value: bigint | number | null | undefined): number {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return 0;
  }
}

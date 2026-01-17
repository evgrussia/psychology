import { Prisma } from '@prisma/client';

export interface AnalyticsFilters {
  topic?: string;
  serviceSlug?: string;
  tgFlow?: string;
}

export interface AnalyticsFilterOptions {
  eventAlias?: string;
  leadAlias?: string;
  includeLeadTopic?: boolean;
}

export function buildAnalyticsFilters(
  filters: AnalyticsFilters,
  options: AnalyticsFilterOptions = {},
): Prisma.Sql[] {
  const eventAlias = options.eventAlias ?? 'e';
  const leadAlias = options.leadAlias ?? 'l';
  const conditions: Prisma.Sql[] = [];

  if (filters.topic) {
    if (options.includeLeadTopic) {
      conditions.push(
        Prisma.sql`COALESCE(${Prisma.raw(eventAlias)}.properties->>'topic', ${Prisma.raw(leadAlias)}.topic_code) = ${filters.topic}`,
      );
    } else {
      conditions.push(
        Prisma.sql`${Prisma.raw(eventAlias)}.properties->>'topic' = ${filters.topic}`,
      );
    }
  }

  if (filters.serviceSlug) {
    conditions.push(
      Prisma.sql`${Prisma.raw(eventAlias)}.properties->>'service_slug' = ${filters.serviceSlug}`,
    );
  }

  if (filters.tgFlow) {
    conditions.push(
      Prisma.sql`${Prisma.raw(eventAlias)}.properties->>'tg_flow' = ${filters.tgFlow}`,
    );
  }

  return conditions;
}

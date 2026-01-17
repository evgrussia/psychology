import { Injectable } from '@nestjs/common';
import { IAnalyticsEventRepository, AnalyticsEventInput } from '@domain/analytics/repositories/IAnalyticsEventRepository';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PrismaAnalyticsEventRepository implements IAnalyticsEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: AnalyticsEventInput): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        schema_version: event.schemaVersion,
        event_name: event.eventName,
        event_version: event.eventVersion,
        event_id: event.eventId,
        occurred_at: event.occurredAt,
        source: event.source,
        environment: event.environment,
        session_id: event.sessionId ?? null,
        anonymous_id: event.anonymousId ?? null,
        user_id: event.userId ?? null,
        lead_id: event.leadId ?? null,
        page: (event.page as any) ?? undefined,
        acquisition: (event.acquisition as any) ?? undefined,
        properties: (event.properties as any) ?? undefined,
      },
    });
  }

  async existsByEventId(eventId: string): Promise<boolean> {
    const record = await this.prisma.analyticsEvent.findFirst({
      where: { event_id: eventId },
      select: { id: true },
    });
    return Boolean(record);
  }
}

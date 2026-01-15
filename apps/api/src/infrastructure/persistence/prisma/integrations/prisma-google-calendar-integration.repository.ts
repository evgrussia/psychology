import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IGoogleCalendarIntegrationRepository } from '@domain/integrations/repositories/IGoogleCalendarIntegrationRepository';
import { GoogleCalendarIntegration } from '@domain/integrations/entities/GoogleCalendarIntegration';
import { GoogleCalendarIntegrationMapper } from './google-calendar-integration.mapper';

@Injectable()
export class PrismaGoogleCalendarIntegrationRepository implements IGoogleCalendarIntegrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findLatest(): Promise<GoogleCalendarIntegration | null> {
    const integration = await this.prisma.googleCalendarIntegration.findFirst({
      orderBy: { created_at: 'desc' },
    });

    if (!integration) {
      return null;
    }

    return GoogleCalendarIntegrationMapper.toDomain(integration);
  }

  async findByOAuthState(state: string): Promise<GoogleCalendarIntegration | null> {
    const integration = await this.prisma.googleCalendarIntegration.findFirst({
      where: { oauth_state: state },
    });

    if (!integration) {
      return null;
    }

    return GoogleCalendarIntegrationMapper.toDomain(integration);
  }

  async save(integration: GoogleCalendarIntegration): Promise<void> {
    const data = GoogleCalendarIntegrationMapper.toPrisma(integration);

    await this.prisma.googleCalendarIntegration.upsert({
      where: { id: integration.id },
      update: data,
      create: data as any,
    });
  }
}

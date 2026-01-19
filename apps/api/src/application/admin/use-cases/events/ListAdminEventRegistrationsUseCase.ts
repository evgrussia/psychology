import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class ListAdminEventRegistrationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(eventId: string) {
    const items = await this.prisma.eventRegistration.findMany({
      where: { event_id: eventId },
      orderBy: { submitted_at: 'desc' },
    });
    return items.map((item) => ({
      id: item.id,
      event_id: item.event_id,
      preferred_contact: item.preferred_contact,
      submitted_at: item.submitted_at.toISOString(),
      consent_personal_data: item.consent_personal_data,
      consent_communications: item.consent_communications,
    }));
  }
}


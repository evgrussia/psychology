import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ILeadRepository } from '@domain/crm/repositories/ILeadRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { LeadDetailResponseDto } from '../../dto/leads.dto';

@Injectable()
export class GetLeadDetailsUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(leadId: string): Promise<LeadDetailResponseDto> {
    const lead = await this.leadRepository.getLeadDetails(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const identities = lead.identities.map((identity) => ({
      id: identity.id,
      userId: identity.userId,
      anonymousId: identity.anonymousId,
      email: identity.emailEncrypted ? this.safeDecrypt(identity.emailEncrypted) : identity.user?.email ?? null,
      phone: identity.phoneEncrypted ? this.safeDecrypt(identity.phoneEncrypted) : identity.user?.phone ?? null,
      telegramUserId: identity.telegramUserId ?? identity.user?.telegramUserId ?? null,
      isPrimary: identity.isPrimary,
      createdAt: identity.createdAt,
      user: identity.user ?? null,
    }));

    const notes = lead.notes.map((note) => ({
      id: note.id,
      leadId: note.leadId,
      authorUserId: note.authorUserId,
      text: this.safeDecrypt(note.noteEncrypted),
      createdAt: note.createdAt,
      author: note.author ?? null,
    }));

    return {
      id: lead.id,
      status: lead.status,
      source: lead.source,
      topicCode: lead.topicCode,
      utm: lead.utm,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      identities,
      timelineEvents: lead.timelineEvents.map((event) => ({
        id: event.id,
        eventName: event.eventName,
        source: event.source,
        occurredAt: event.occurredAt,
        deepLinkId: event.deepLinkId,
        properties: this.sanitizeTimelineProperties(event.properties),
      })),
      notes,
      consents: lead.consents,
    };
  }

  private safeDecrypt(ciphertext: string): string {
    try {
      return this.encryptionService.decrypt(ciphertext);
    } catch {
      return '[encrypted]';
    }
  }

  private sanitizeTimelineProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const blockedKeyPattern = /(email|phone|name|text|message|question|answer|note|payload|content|body|diagnos)/i;

    Object.entries(properties ?? {}).forEach(([key, value]) => {
      if (blockedKeyPattern.test(key)) {
        return;
      }
      sanitized[key] = value;
    });

    return sanitized;
  }
}

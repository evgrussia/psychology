import { Lead as PrismaLead, LeadSource as PrismaLeadSource, LeadStatus as PrismaLeadStatus } from '@prisma/client';
import { Lead } from '@domain/crm/entities/Lead';
import { LeadSource, LeadStatus } from '@domain/crm/value-objects/LeadEnums';

export class LeadMapper {
  static toDomain(record: PrismaLead): Lead {
    return Lead.reconstitute({
      id: record.id,
      status: this.mapStatusToDomain(record.status),
      source: this.mapSourceToDomain(record.source),
      topicCode: record.topic_code,
      utm: record.utm as Record<string, any> | null,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  }

  static toPersistence(entity: Lead) {
    return {
      id: entity.id,
      status: this.mapStatusToPrisma(entity.status),
      source: this.mapSourceToPrisma(entity.source),
      topic_code: entity.topicCode ?? null,
      utm: entity.utm ?? null,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  private static mapStatusToDomain(status: PrismaLeadStatus): LeadStatus {
    switch (status) {
      case PrismaLeadStatus.new:
        return LeadStatus.new;
      case PrismaLeadStatus.engaged:
        return LeadStatus.engaged;
      case PrismaLeadStatus.booking_started:
        return LeadStatus.booking_started;
      case PrismaLeadStatus.booked_confirmed:
        return LeadStatus.booked_confirmed;
      case PrismaLeadStatus.paid:
        return LeadStatus.paid;
      case PrismaLeadStatus.completed_session:
        return LeadStatus.completed_session;
      case PrismaLeadStatus.follow_up_needed:
        return LeadStatus.follow_up_needed;
      case PrismaLeadStatus.inactive:
        return LeadStatus.inactive;
      default:
        throw new Error(`Unknown LeadStatus: ${status}`);
    }
  }

  private static mapSourceToDomain(source: PrismaLeadSource): LeadSource {
    switch (source) {
      case PrismaLeadSource.quiz:
        return LeadSource.quiz;
      case PrismaLeadSource.telegram:
        return LeadSource.telegram;
      case PrismaLeadSource.waitlist:
        return LeadSource.waitlist;
      case PrismaLeadSource.question:
        return LeadSource.question;
      case PrismaLeadSource.booking:
        return LeadSource.booking;
      default:
        throw new Error(`Unknown LeadSource: ${source}`);
    }
  }

  private static mapStatusToPrisma(status: LeadStatus): PrismaLeadStatus {
    switch (status) {
      case LeadStatus.new:
        return PrismaLeadStatus.new;
      case LeadStatus.engaged:
        return PrismaLeadStatus.engaged;
      case LeadStatus.booking_started:
        return PrismaLeadStatus.booking_started;
      case LeadStatus.booked_confirmed:
        return PrismaLeadStatus.booked_confirmed;
      case LeadStatus.paid:
        return PrismaLeadStatus.paid;
      case LeadStatus.completed_session:
        return PrismaLeadStatus.completed_session;
      case LeadStatus.follow_up_needed:
        return PrismaLeadStatus.follow_up_needed;
      case LeadStatus.inactive:
        return PrismaLeadStatus.inactive;
      default:
        throw new Error(`Unknown LeadStatus: ${status}`);
    }
  }

  private static mapSourceToPrisma(source: LeadSource): PrismaLeadSource {
    switch (source) {
      case LeadSource.quiz:
        return PrismaLeadSource.quiz;
      case LeadSource.telegram:
        return PrismaLeadSource.telegram;
      case LeadSource.waitlist:
        return PrismaLeadSource.waitlist;
      case LeadSource.question:
        return PrismaLeadSource.question;
      case LeadSource.booking:
        return PrismaLeadSource.booking;
      default:
        throw new Error(`Unknown LeadSource: ${source}`);
    }
  }
}

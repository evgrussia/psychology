import { AuditLogEntry as PrismaAuditLogEntry } from '@prisma/client';
import { AuditLogEntry } from '@domain/audit/entities/AuditLogEntry';

export class AuditLogEntryMapper {
  static toDomain(prismaEntry: PrismaAuditLogEntry): AuditLogEntry {
    return AuditLogEntry.reconstitute({
      id: prismaEntry.id,
      actorUserId: prismaEntry.actor_user_id,
      actorRole: prismaEntry.actor_role,
      action: prismaEntry.action,
      entityType: prismaEntry.entity_type,
      entityId: prismaEntry.entity_id,
      oldValue: prismaEntry.old_value as Record<string, any> | null,
      newValue: prismaEntry.new_value as Record<string, any> | null,
      ipAddress: prismaEntry.ip_address,
      userAgent: prismaEntry.user_agent,
      createdAt: prismaEntry.created_at,
    });
  }

  static toPersistence(entry: AuditLogEntry) {
    return {
      id: entry.id,
      actor_user_id: entry.actorUserId,
      actor_role: entry.actorRole,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      old_value: entry.oldValue,
      new_value: entry.newValue,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      created_at: entry.createdAt,
    };
  }
}

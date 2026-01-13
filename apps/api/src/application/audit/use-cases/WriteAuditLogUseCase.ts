import { Injectable, Inject, Logger } from '@nestjs/common';
import { IAuditLogRepository } from '../../../domain/audit/repositories/IAuditLogRepository';
import { AuditLogEntry } from '../../../domain/audit/entities/AuditLogEntry';
import { WriteAuditLogDto } from '../dto/audit-log.dto';
import { AuditLogSanitizer } from '../utils/audit-log-sanitizer';
import { randomUUID } from 'crypto';

@Injectable()
export class WriteAuditLogUseCase {
  private readonly logger = new Logger(WriteAuditLogUseCase.name);

  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  /**
   * Writes an audit log entry.
   * Sanitizes old/new values to remove P2 and minimize P1 data.
   * 
   * This is designed to be "best effort" - if logging fails for non-critical actions,
   * it should not break the business operation. For critical actions (like data export),
   * the caller should handle errors appropriately.
   */
  async execute(dto: WriteAuditLogDto): Promise<void> {
    try {
      // Sanitize old/new values to remove P2 and minimize P1
      const sanitizedOldValue = dto.oldValue
        ? AuditLogSanitizer.sanitizeValue(dto.oldValue)
        : null;
      const sanitizedNewValue = dto.newValue
        ? AuditLogSanitizer.sanitizeValue(dto.newValue)
        : null;

      const entry = AuditLogEntry.create({
        id: randomUUID(),
        actorUserId: dto.actorUserId,
        actorRole: dto.actorRole,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId || null,
        oldValue: sanitizedOldValue,
        newValue: sanitizedNewValue,
        ipAddress: dto.ipAddress || null,
        userAgent: dto.userAgent || null,
        createdAt: new Date(),
      });

      await this.auditLogRepository.save(entry);
    } catch (error) {
      // Log error but don't throw - audit logging should be "best effort"
      // for non-critical actions. Critical actions should handle this differently.
      this.logger.error(`Failed to write audit log entry: ${error.message}`, error.stack);
      // Re-throw for critical operations that require audit logging
      // The caller can decide whether to fail the operation or continue
      throw error;
    }
  }
}

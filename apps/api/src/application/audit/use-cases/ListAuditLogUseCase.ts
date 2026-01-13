import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { IAuditLogRepository } from '../../../domain/audit/repositories/IAuditLogRepository';
import { ListAuditLogDto, ListAuditLogResponseDto, AuditLogEntryResponseDto } from '../dto/audit-log.dto';
import { Role } from '../../../domain/identity/value-objects/Role';

@Injectable()
export class ListAuditLogUseCase {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  /**
   * Lists audit log entries with filters and pagination.
   * 
   * Access control:
   * - owner: sees all entries
   * - assistant: sees only their own entries
   * - editor: no access (should be checked at controller level)
   */
  async execute(
    dto: ListAuditLogDto,
    currentUserId: string,
    currentUserRoles: string[],
  ): Promise<ListAuditLogResponseDto> {
    // Check if user has access
    const userRoles = currentUserRoles.map((r) => Role.fromCode(r));
    const isOwner = userRoles.some((r) => r.code === Role.OWNER.code);
    const isAssistant = userRoles.some((r) => r.code === Role.ASSISTANT.code);

    if (!isOwner && !isAssistant) {
      throw new ForbiddenException('You do not have access to audit log');
    }

    // Assistant can only see their own entries
    const filters = {
      ...(dto.actorUserId && { actorUserId: dto.actorUserId }),
      ...(dto.action && { action: dto.action }),
      ...(dto.entityType && { entityType: dto.entityType }),
      ...(dto.entityId && { entityId: dto.entityId }),
      ...(dto.fromDate && { fromDate: new Date(dto.fromDate) }),
      ...(dto.toDate && { toDate: new Date(dto.toDate) }),
    };

    // If assistant, force filter to their own user ID
    if (isAssistant && !isOwner) {
      filters.actorUserId = currentUserId;
    }

    const pagination = {
      page: dto.page || 1,
      pageSize: dto.pageSize || 20,
    };

    const result = await this.auditLogRepository.findMany(filters, pagination);

    return {
      items: result.items.map((entry) => this.toResponseDto(entry)),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  private toResponseDto(entry: any): AuditLogEntryResponseDto {
    return {
      id: entry.id,
      actorUserId: entry.actorUserId,
      actorRole: entry.actorRole,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      createdAt: entry.createdAt,
    };
  }
}

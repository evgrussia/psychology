import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IAuditLogRepository, AuditLogFilters, PaginationParams, PaginatedResult } from '@domain/audit/repositories/IAuditLogRepository';
import { AuditLogEntry } from '@domain/audit/entities/AuditLogEntry';
import { AuditLogEntryMapper } from './audit-log-entry.mapper';

@Injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entry: AuditLogEntry): Promise<void> {
    const data = AuditLogEntryMapper.toPersistence(entry);
    await this.prisma.auditLogEntry.create({
      data,
    });
  }

  async findById(id: string): Promise<AuditLogEntry | null> {
    const prismaEntry = await this.prisma.auditLogEntry.findUnique({
      where: { id },
    });

    if (!prismaEntry) {
      return null;
    }

    return AuditLogEntryMapper.toDomain(prismaEntry);
  }

  async findMany(
    filters: AuditLogFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLogEntry>> {
    const where: any = {};

    if (filters.actorUserId) {
      where.actor_user_id = filters.actorUserId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.entityType) {
      where.entity_type = filters.entityType;
    }

    if (filters.entityId) {
      where.entity_id = filters.entityId;
    }

    if (filters.fromDate || filters.toDate) {
      where.created_at = {};
      if (filters.fromDate) {
        where.created_at.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.created_at.lte = filters.toDate;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLogEntry.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.prisma.auditLogEntry.count({ where }),
    ]);

    return {
      items: items.map((item) => AuditLogEntryMapper.toDomain(item)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }
}

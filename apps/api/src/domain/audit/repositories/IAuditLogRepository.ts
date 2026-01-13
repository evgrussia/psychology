import { AuditLogEntry } from '../entities/AuditLogEntry';

export interface AuditLogFilters {
  actorUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IAuditLogRepository {
  save(entry: AuditLogEntry): Promise<void>;
  findById(id: string): Promise<AuditLogEntry | null>;
  findMany(
    filters: AuditLogFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AuditLogEntry>>;
}

import { Controller, Get, Query, UseGuards, Req, Header, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ListAuditLogUseCase } from '../../application/audit/use-cases/ListAuditLogUseCase';
import { ListAuditLogDto, ListAuditLogResponseDto, AuditLogAction } from '../../application/audit/dto/audit-log.dto';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { Response } from 'express';

@ApiTags('admin')
@Controller('admin/audit-log')
@UseGuards(AuthGuard, RolesGuard)
export class AdminAuditLogController {
  constructor(
    private readonly listAuditLogUseCase: ListAuditLogUseCase,
  ) {}

  @Get()
  @Roles(...AdminPermissions.auditLog.list)
  @ApiOperation({ summary: 'List audit log entries' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiQuery({ name: 'actorUserId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, enum: AuditLogAction })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'ISO 8601 date-time string' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'ISO 8601 date-time string' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listAuditLog(
    @Query() query: ListAuditLogDto,
    @Req() request: any,
  ): Promise<ListAuditLogResponseDto> {
    const user = request.user;
    return this.listAuditLogUseCase.execute(
      query,
      user.id,
      user.roles,
    );
  }

  @Get('export')
  @Roles(...AdminPermissions.auditLog.list)
  @ApiOperation({ summary: 'Export audit log entries' })
  @ApiResponse({ status: 200, description: 'Returns audit log export' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Header('Cache-Control', 'no-store')
  async exportAuditLog(
    @Query() query: ListAuditLogDto,
    @Query('format') format: string | undefined,
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const exportFormat = (format || 'csv').toLowerCase();
    if (!['csv', 'json'].includes(exportFormat)) {
      throw new BadRequestException('Unsupported export format');
    }

    const user = request.user;
    const data = await this.listAuditLogUseCase.execute(
      { ...query, page: 1, pageSize: 5000 },
      user.id,
      user.roles,
    );

    if (exportFormat === 'json') {
      response.setHeader('Content-Disposition', 'attachment; filename="audit-log.json"');
      return data.items;
    }

    const header = [
      'created_at',
      'actor_user_id',
      'actor_role',
      'action',
      'entity_type',
      'entity_id',
      'ip_address',
      'user_agent',
      'old_value',
      'new_value',
    ];
    const rows = data.items.map((entry) => [
      entry.createdAt?.toISOString?.() ?? String(entry.createdAt),
      entry.actorUserId ?? '',
      entry.actorRole ?? '',
      entry.action ?? '',
      entry.entityType ?? '',
      entry.entityId ?? '',
      entry.ipAddress ?? '',
      entry.userAgent ?? '',
      JSON.stringify(entry.oldValue ?? {}),
      JSON.stringify(entry.newValue ?? {}),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => this.escapeCsv(value)).join(','))
      .join('\n');

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    return csv;
  }

  private escapeCsv(value: string) {
    const escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  }
}

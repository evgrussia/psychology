import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ListAuditLogUseCase } from '../../application/audit/use-cases/ListAuditLogUseCase';
import { ListAuditLogDto, ListAuditLogResponseDto, AuditLogAction } from '../../application/audit/dto/audit-log.dto';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';

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
}

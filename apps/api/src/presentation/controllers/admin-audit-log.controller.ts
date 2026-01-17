import { Controller, Get, Query, UseGuards, SetMetadata, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ListAuditLogUseCase } from '../../application/audit/use-cases/ListAuditLogUseCase';
import { ListAuditLogDto, ListAuditLogResponseDto } from '../../application/audit/dto/audit-log.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin')
@Controller('admin/audit-log')
@UseGuards(AuthGuard, RolesGuard)
export class AdminAuditLogController {
  constructor(
    private readonly listAuditLogUseCase: ListAuditLogUseCase,
  ) {}

  @Get()
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'List audit log entries' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiQuery({ name: 'actorUserId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, enum: ['admin_price_changed', 'admin_data_exported', 'admin_content_published', 'admin_content_deleted', 'admin_appointment_deleted', 'admin_role_changed', 'admin_login', 'admin_settings_changed', 'admin_google_calendar_connect_started', 'admin_google_calendar_connected', 'admin_interactive_updated', 'admin_interactive_published', 'admin_lead_status_changed', 'admin_lead_note_added', 'admin_moderation_approved', 'admin_moderation_rejected', 'admin_moderation_escalated', 'admin_moderation_answered'] })
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

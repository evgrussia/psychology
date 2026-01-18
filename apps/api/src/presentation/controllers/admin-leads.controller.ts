import { Body, Controller, Get, HttpCode, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ListLeadsUseCase } from '../../application/admin/use-cases/leads/ListLeadsUseCase';
import { GetLeadDetailsUseCase } from '../../application/admin/use-cases/leads/GetLeadDetailsUseCase';
import { UpdateLeadStatusUseCase } from '../../application/admin/use-cases/leads/UpdateLeadStatusUseCase';
import { AddLeadNoteUseCase } from '../../application/admin/use-cases/leads/AddLeadNoteUseCase';
import { AddLeadNoteDto, ListLeadsQueryDto, UpdateLeadStatusDto } from '../../application/admin/dto/leads.dto';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';

@ApiTags('admin/leads')
@Controller('admin/leads')
@UseGuards(AuthGuard, RolesGuard)
export class AdminLeadsController {
  constructor(
    private readonly listLeadsUseCase: ListLeadsUseCase,
    private readonly getLeadDetailsUseCase: GetLeadDetailsUseCase,
    private readonly updateLeadStatusUseCase: UpdateLeadStatusUseCase,
    private readonly addLeadNoteUseCase: AddLeadNoteUseCase,
  ) {}

  @Get()
  @Roles(...AdminPermissions.leads.list)
  @ApiOperation({ summary: 'List CRM leads' })
  @ApiResponse({ status: 200, description: 'Leads list' })
  async list(@Query() query: ListLeadsQueryDto) {
    return this.listLeadsUseCase.execute(query);
  }

  @Get(':leadId')
  @Roles(...AdminPermissions.leads.get)
  @ApiOperation({ summary: 'Get lead details' })
  @ApiResponse({ status: 200, description: 'Lead details' })
  async getLead(@Param('leadId') leadId: string) {
    return this.getLeadDetailsUseCase.execute(leadId);
  }

  @Post(':leadId/status')
  @HttpCode(200)
  @Roles(...AdminPermissions.leads.updateStatus)
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: 200, description: 'Lead status updated' })
  async updateStatus(
    @Param('leadId') leadId: string,
    @Body() dto: UpdateLeadStatusDto,
    @Request() req: any,
  ) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = AuditLogHelper.extractIpAddress(req);
    const userAgent = AuditLogHelper.extractUserAgent(req);

    await this.updateLeadStatusUseCase.execute(
      leadId,
      dto.status,
      actorUserId,
      actorRole,
      ipAddress,
      userAgent,
    );
    return { status: 'ok' };
  }

  @Post(':leadId/notes')
  @Roles(...AdminPermissions.leads.addNote)
  @ApiOperation({ summary: 'Add lead note' })
  @ApiResponse({ status: 201, description: 'Lead note created' })
  async addNote(
    @Param('leadId') leadId: string,
    @Body() dto: AddLeadNoteDto,
    @Request() req: any,
  ) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = AuditLogHelper.extractIpAddress(req);
    const userAgent = AuditLogHelper.extractUserAgent(req);

    return this.addLeadNoteUseCase.execute(
      leadId,
      dto.text,
      actorUserId,
      actorRole,
      ipAddress,
      userAgent,
    );
  }
}

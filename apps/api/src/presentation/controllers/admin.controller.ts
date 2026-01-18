import { Controller, Get, Post, Body, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { CreateAdminUserInviteUseCase } from '../../application/identity/use-cases/CreateAdminUserInviteUseCase';
import { ExportDataUseCase, ExportDataDto } from '../../application/admin/use-cases/ExportDataUseCase';
import { UpdateServicePriceUseCase, UpdateServicePriceDto } from '../../application/admin/use-cases/UpdateServicePriceUseCase';
import { UpdateSystemSettingsUseCase, UpdateSystemSettingsDto } from '../../application/admin/use-cases/UpdateSystemSettingsUseCase';
import { CreateAdminInviteDto } from '../../application/identity/dto/invite.dto';
import { GetAdminDashboardUseCase } from '../../application/admin/use-cases/GetAdminDashboardUseCase';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly createAdminUserInviteUseCase: CreateAdminUserInviteUseCase,
    private readonly exportDataUseCase: ExportDataUseCase,
    private readonly updateServicePriceUseCase: UpdateServicePriceUseCase,
    private readonly updateSystemSettingsUseCase: UpdateSystemSettingsUseCase,
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
  ) {}

  @Get('dashboard')
  @Roles(...AdminPermissions.dashboard)
  @ApiOperation({ summary: 'Get dashboard data' })
  @ApiResponse({ status: 200, description: 'Return dashboard data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDashboard(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.getAdminDashboardUseCase.execute({ range, from, to });
  }

  @Get('settings')
  @Roles(...AdminPermissions.settings.read)
  @ApiOperation({ summary: 'Get system settings' })
  async getSettings() {
    return {
      maintenanceMode: false,
      registrationEnabled: true,
    };
  }

  @Patch('settings')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(@Body() dto: UpdateSystemSettingsDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateSystemSettingsUseCase.execute(dto, actorUserId, actorRole);
  }

  @Get('content')
  @Roles(...AdminPermissions.content.list)
  @ApiOperation({ summary: 'Get content list' })
  async getContent() {
    return {
      articles: [],
    };
  }

  @Post('invites')
  @Roles(...AdminPermissions.invites.create)
  @ApiOperation({ summary: 'Create admin invite' })
  @ApiResponse({ status: 201, description: 'Invite created' })
  async createInvite(@Body() dto: CreateAdminInviteDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.createAdminUserInviteUseCase.execute(dto, actorUserId, actorRole);
  }

  @Post('export')
  @Roles(...AdminPermissions.exports.data)
  @ApiOperation({ summary: 'Export data' })
  @ApiResponse({ status: 200, description: 'Export initiated' })
  async exportData(@Body() dto: ExportDataDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'admin';
    return this.exportDataUseCase.execute(dto, actorUserId, actorRole);
  }

  @Patch('services/price')
  @Roles(...AdminPermissions.services.updatePrice)
  @ApiOperation({ summary: 'Update service price' })
  async updateServicePrice(@Body() dto: UpdateServicePriceDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateServicePriceUseCase.execute(dto, actorUserId, actorRole);
  }
}

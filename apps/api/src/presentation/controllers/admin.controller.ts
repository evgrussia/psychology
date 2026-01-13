import { Controller, Get, Post, Body, UseGuards, SetMetadata, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateAdminUserInviteUseCase } from '../../application/identity/use-cases/CreateAdminUserInviteUseCase';
import { ExportDataUseCase, ExportDataDto } from '../../application/admin/use-cases/ExportDataUseCase';
import { UpdateServicePriceUseCase, UpdateServicePriceDto } from '../../application/admin/use-cases/UpdateServicePriceUseCase';
import { UpdateSystemSettingsUseCase, UpdateSystemSettingsDto } from '../../application/admin/use-cases/UpdateSystemSettingsUseCase';
import { CreateAdminInviteDto } from '../../application/identity/dto/invite.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly createAdminUserInviteUseCase: CreateAdminUserInviteUseCase,
    private readonly exportDataUseCase: ExportDataUseCase,
    private readonly updateServicePriceUseCase: UpdateServicePriceUseCase,
    private readonly updateSystemSettingsUseCase: UpdateSystemSettingsUseCase,
  ) {}

  @Get('dashboard')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get dashboard data' })
  @ApiResponse({ status: 200, description: 'Return dashboard data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getDashboard() {
    return {
      stats: {
        totalLeads: 42,
        upcomingAppointments: 5,
        pendingModeration: 3,
      },
    };
  }

  @Get('settings')
  @Roles('owner')
  @ApiOperation({ summary: 'Get system settings' })
  async getSettings() {
    return {
      maintenanceMode: false,
      registrationEnabled: true,
    };
  }

  @Patch('settings')
  @Roles('owner')
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(@Body() dto: UpdateSystemSettingsDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateSystemSettingsUseCase.execute(dto, actorUserId, actorRole);
  }

  @Get('content')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Get content list' })
  async getContent() {
    return {
      articles: [],
    };
  }

  @Post('invites')
  @Roles('owner')
  @ApiOperation({ summary: 'Create admin invite' })
  @ApiResponse({ status: 201, description: 'Invite created' })
  async createInvite(@Body() dto: CreateAdminInviteDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.createAdminUserInviteUseCase.execute(dto, actorUserId, actorRole);
  }

  @Post('export')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Export data' })
  @ApiResponse({ status: 200, description: 'Export initiated' })
  async exportData(@Body() dto: ExportDataDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'admin';
    return this.exportDataUseCase.execute(dto, actorUserId, actorRole);
  }

  @Patch('services/price')
  @Roles('owner')
  @ApiOperation({ summary: 'Update service price' })
  async updateServicePrice(@Body() dto: UpdateServicePriceDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateServicePriceUseCase.execute(dto, actorUserId, actorRole);
  }
}

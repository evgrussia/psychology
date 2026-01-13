import { Controller, Get, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateAdminUserInviteUseCase } from '../../application/identity/use-cases/CreateAdminUserInviteUseCase';
import { CreateAdminInviteDto } from '../../application/identity/dto/invite.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly createAdminUserInviteUseCase: CreateAdminUserInviteUseCase,
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
  async createInvite(@Body() dto: CreateAdminInviteDto) {
    return this.createAdminUserInviteUseCase.execute(dto);
  }
}

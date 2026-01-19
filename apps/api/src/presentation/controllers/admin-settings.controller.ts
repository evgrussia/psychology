import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { GetAdminProfileUseCase } from '../../application/admin/use-cases/settings/GetAdminProfileUseCase';
import { UpdateAdminProfileUseCase, UpdateAdminProfileDto } from '../../application/admin/use-cases/settings/UpdateAdminProfileUseCase';
import { ListAdminUsersUseCase } from '../../application/admin/use-cases/settings/ListAdminUsersUseCase';
import { UpdateAdminUserRoleUseCase, UpdateAdminUserRoleDto } from '../../application/admin/use-cases/settings/UpdateAdminUserRoleUseCase';
import { UpdateAdminUserStatusUseCase } from '../../application/admin/use-cases/settings/UpdateAdminUserStatusUseCase';
import { DeleteAdminUserUseCase } from '../../application/admin/use-cases/settings/DeleteAdminUserUseCase';
import { CreateAdminUserInviteUseCase } from '../../application/identity/use-cases/CreateAdminUserInviteUseCase';
import { CreateAdminInviteDto } from '../../application/identity/dto/invite.dto';

@ApiTags('admin')
@Controller('admin/settings')
@UseGuards(AuthGuard, RolesGuard)
export class AdminSettingsController {
  constructor(
    private readonly getAdminProfileUseCase: GetAdminProfileUseCase,
    private readonly updateAdminProfileUseCase: UpdateAdminProfileUseCase,
    private readonly listAdminUsersUseCase: ListAdminUsersUseCase,
    private readonly updateAdminUserRoleUseCase: UpdateAdminUserRoleUseCase,
    private readonly updateAdminUserStatusUseCase: UpdateAdminUserStatusUseCase,
    private readonly deleteAdminUserUseCase: DeleteAdminUserUseCase,
    private readonly createAdminUserInviteUseCase: CreateAdminUserInviteUseCase,
  ) {}

  @Get('profile')
  @Roles(...AdminPermissions.settings.read)
  @ApiOperation({ summary: 'Get admin profile settings' })
  async getProfile(@Request() req: any) {
    const userId = req.user?.id;
    return this.getAdminProfileUseCase.execute(userId);
  }

  @Patch('profile')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Update admin profile settings' })
  async updateProfile(@Body() dto: UpdateAdminProfileDto, @Request() req: any) {
    const userId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateAdminProfileUseCase.execute(userId, dto, actorRole);
  }

  @Get('users')
  @Roles(...AdminPermissions.settings.read)
  @ApiOperation({ summary: 'List admin users' })
  async listUsers() {
    return this.listAdminUsersUseCase.execute();
  }

  @Post('users/invite')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Invite admin user' })
  @ApiResponse({ status: 201, description: 'Invite created' })
  async inviteUser(@Body() dto: CreateAdminInviteDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.createAdminUserInviteUseCase.execute(dto, actorUserId, actorRole);
  }

  @Patch('users/:id/role')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Update admin user role' })
  async updateUserRole(@Param('id') userId: string, @Body() dto: UpdateAdminUserRoleDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateAdminUserRoleUseCase.execute(userId, dto, actorUserId, actorRole);
  }

  @Post('users/:id/block')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Block admin user' })
  async blockUser(@Param('id') userId: string) {
    return this.updateAdminUserStatusUseCase.execute(userId, { status: 'blocked' });
  }

  @Post('users/:id/unblock')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Unblock admin user' })
  async unblockUser(@Param('id') userId: string) {
    return this.updateAdminUserStatusUseCase.execute(userId, { status: 'active' });
  }

  @Delete('users/:id')
  @Roles(...AdminPermissions.settings.update)
  @ApiOperation({ summary: 'Delete admin user' })
  async deleteUser(@Param('id') userId: string) {
    return this.deleteAdminUserUseCase.execute(userId);
  }
}

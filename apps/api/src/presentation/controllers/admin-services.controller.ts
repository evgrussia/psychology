import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ListAdminServicesUseCase } from '../../application/admin/use-cases/services/ListAdminServicesUseCase';
import { GetAdminServiceUseCase } from '../../application/admin/use-cases/services/GetAdminServiceUseCase';
import { UpsertAdminServiceUseCase, UpsertAdminServiceDto } from '../../application/admin/use-cases/services/UpsertAdminServiceUseCase';
import { PublishAdminServiceUseCase } from '../../application/admin/use-cases/services/PublishAdminServiceUseCase';

@ApiTags('admin/services')
@ApiBearerAuth()
@Controller('admin/services')
@UseGuards(AuthGuard, RolesGuard)
export class AdminServicesController {
  constructor(
    private readonly listUseCase: ListAdminServicesUseCase,
    private readonly getUseCase: GetAdminServiceUseCase,
    private readonly upsertUseCase: UpsertAdminServiceUseCase,
    private readonly publishUseCase: PublishAdminServiceUseCase,
  ) {}

  @Get()
  @Roles(...AdminPermissions.services.list)
  @ApiOperation({ summary: 'List all services (admin)' })
  async list() {
    return this.listUseCase.execute();
  }

  @Get(':id')
  @Roles(...AdminPermissions.services.get)
  @ApiOperation({ summary: 'Get service by id (admin)' })
  async get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post()
  @Roles(...AdminPermissions.services.upsert)
  @ApiOperation({ summary: 'Create service (admin)' })
  async create(@Body() dto: UpsertAdminServiceDto) {
    return this.upsertUseCase.create(dto);
  }

  @Put(':id')
  @Roles(...AdminPermissions.services.upsert)
  @ApiOperation({ summary: 'Update service (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpsertAdminServiceDto) {
    return this.upsertUseCase.update(id, dto);
  }

  @Post(':id/publish')
  @Roles(...AdminPermissions.services.publish)
  @ApiOperation({ summary: 'Publish service (admin)' })
  async publish(@Param('id') id: string) {
    return this.publishUseCase.publish(id);
  }
}


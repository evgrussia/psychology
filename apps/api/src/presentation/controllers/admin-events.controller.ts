import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ListAdminEventsUseCase } from '@application/admin/use-cases/events/ListAdminEventsUseCase';
import { GetAdminEventUseCase } from '@application/admin/use-cases/events/GetAdminEventUseCase';
import { UpsertAdminEventUseCase, UpsertAdminEventDto } from '@application/admin/use-cases/events/UpsertAdminEventUseCase';
import { PublishAdminEventUseCase } from '@application/admin/use-cases/events/PublishAdminEventUseCase';
import { ListAdminEventRegistrationsUseCase } from '@application/admin/use-cases/events/ListAdminEventRegistrationsUseCase';

@ApiTags('admin/events')
@ApiBearerAuth()
@Controller('admin/events')
@UseGuards(AuthGuard, RolesGuard)
export class AdminEventsController {
  constructor(
    private readonly listUseCase: ListAdminEventsUseCase,
    private readonly getUseCase: GetAdminEventUseCase,
    private readonly upsertUseCase: UpsertAdminEventUseCase,
    private readonly publishUseCase: PublishAdminEventUseCase,
    private readonly listRegistrationsUseCase: ListAdminEventRegistrationsUseCase,
  ) {}

  @Get()
  @Roles(...AdminPermissions.events.list)
  @ApiOperation({ summary: 'List events (admin)' })
  async list() {
    return this.listUseCase.execute();
  }

  @Get(':id')
  @Roles(...AdminPermissions.events.get)
  @ApiOperation({ summary: 'Get event (admin)' })
  async get(@Param('id') id: string) {
    return this.getUseCase.execute(id);
  }

  @Post()
  @Roles(...AdminPermissions.events.upsert)
  @ApiOperation({ summary: 'Create event (admin)' })
  async create(@Body() dto: UpsertAdminEventDto) {
    return this.upsertUseCase.create(dto);
  }

  @Put(':id')
  @Roles(...AdminPermissions.events.upsert)
  @ApiOperation({ summary: 'Update event (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpsertAdminEventDto) {
    return this.upsertUseCase.update(id, dto);
  }

  @Post(':id/publish')
  @Roles(...AdminPermissions.events.publish)
  @ApiOperation({ summary: 'Publish event (admin)' })
  async publish(@Param('id') id: string) {
    return this.publishUseCase.execute(id);
  }

  @Get(':id/registrations')
  @Roles(...AdminPermissions.events.registrations)
  @ApiOperation({ summary: 'List event registrations (admin)' })
  async registrations(@Param('id') id: string) {
    return this.listRegistrationsUseCase.execute(id);
  }
}


import { Controller, Put, Body, Param, UseGuards, Get, Query, Post, Req, NotFoundException, HttpCode, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { UpdateInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/UpdateInteractiveDefinitionUseCase';
import { CreateInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/CreateInteractiveDefinitionUseCase';
import { GetInteractiveDefinitionByIdUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveDefinitionByIdUseCase';
import { GetPublishedInteractiveDefinitionByIdUseCase } from '../../application/admin/use-cases/interactive/GetPublishedInteractiveDefinitionByIdUseCase';
import { ListInteractiveDefinitionsUseCase } from '../../application/admin/use-cases/interactive/ListInteractiveDefinitionsUseCase';
import { PublishInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/PublishInteractiveDefinitionUseCase';
import { ListInteractiveDefinitionVersionsUseCase } from '../../application/admin/use-cases/interactive/ListInteractiveDefinitionVersionsUseCase';
import { GetInteractiveDefinitionVersionUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveDefinitionVersionUseCase';
import { GetInteractiveOverviewUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveOverviewUseCase';
import { InteractiveConfig } from '../../domain/interactive/types/InteractiveConfig';
import { InteractiveStatus } from '../../domain/interactive/value-objects/InteractiveStatus';
import { InteractiveType } from '../../domain/interactive/value-objects/InteractiveType';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';
import { ValidateNavigatorDefinitionUseCase } from '../../application/interactive/use-cases/ValidateNavigatorDefinitionUseCase';

@ApiTags('admin-interactive')
@Controller('admin/interactive')
@UseGuards(AuthGuard, RolesGuard)
export class AdminInteractiveController {
  constructor(
    private readonly createUseCase: CreateInteractiveDefinitionUseCase,
    private readonly updateUseCase: UpdateInteractiveDefinitionUseCase,
    private readonly getByIdUseCase: GetInteractiveDefinitionByIdUseCase,
    private readonly getPublishedByIdUseCase: GetPublishedInteractiveDefinitionByIdUseCase,
    private readonly listUseCase: ListInteractiveDefinitionsUseCase,
    private readonly publishUseCase: PublishInteractiveDefinitionUseCase,
    private readonly listVersionsUseCase: ListInteractiveDefinitionVersionsUseCase,
    private readonly getVersionUseCase: GetInteractiveDefinitionVersionUseCase,
    private readonly validateNavigatorUseCase: ValidateNavigatorDefinitionUseCase,
    private readonly overviewUseCase: GetInteractiveOverviewUseCase,
  ) {}

  @Get('definitions')
  @Roles(...AdminPermissions.interactive.list)
  @ApiOperation({ summary: 'List interactive definitions' })
  @ApiResponse({ status: 200, description: 'List of definitions' })
  async listDefinitions(
    @Query('type') type?: InteractiveType,
    @Query('status') status?: InteractiveStatus,
  ) {
    return await this.listUseCase.execute({ type, status });
  }

  @Post('rituals')
  @Roles(...AdminPermissions.interactive.create)
  @ApiOperation({ summary: 'Create ritual definition (draft)' })
  async createRitualDefinition(
    @Body() dto: {
      slug: string;
      title: string;
      topicCode?: string | null;
      config?: InteractiveConfig;
    },
  ) {
    if (!dto?.slug?.trim() || !dto?.title?.trim()) {
      throw new BadRequestException('slug and title are required');
    }
    return await this.createUseCase.execute({
      type: InteractiveType.RITUAL,
      slug: dto.slug.trim(),
      title: dto.title.trim(),
      topicCode: dto.topicCode ?? null,
      config: dto.config,
    });
  }

  @Get('overview')
  @Roles(...AdminPermissions.interactive.list)
  @ApiOperation({ summary: 'List interactive overview stats (30d)' })
  async getOverview() {
    return this.overviewUseCase.execute();
  }

  @Get('definitions/:id')
  @Roles(...AdminPermissions.interactive.get)
  @ApiOperation({ summary: 'Get interactive definition by ID' })
  @ApiResponse({ status: 200, description: 'Definition details' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async getDefinition(@Param('id') id: string) {
    return await this.getByIdUseCase.execute(id);
  }

  @Put('definitions/:id')
  @Roles(...AdminPermissions.interactive.update)
  @ApiOperation({ summary: 'Update interactive definition' })
  @ApiResponse({ status: 200, description: 'Definition updated' })
  async updateDefinition(
    @Param('id') id: string,
    @Body() dto: {
      title?: string;
      topicCode?: string | null;
      status?: InteractiveStatus;
      config?: InteractiveConfig;
    },
    @Req() request: any,
  ) {
    const user = request.user;
    await this.updateUseCase.execute(id, dto, {
      userId: user.id,
      role: user.roles?.[0] || 'unknown',
      ipAddress: AuditLogHelper.extractIpAddress(request),
      userAgent: AuditLogHelper.extractUserAgent(request),
    });
  }

  @Post('rituals/:id/archive')
  @HttpCode(200)
  @Roles(...AdminPermissions.interactive.archive)
  @ApiOperation({ summary: 'Archive ritual definition' })
  async archiveRitual(@Param('id') id: string, @Req() request: any) {
    const user = request.user;
    await this.updateUseCase.execute(id, {
      status: InteractiveStatus.ARCHIVED,
    }, {
      userId: user.id,
      role: user.roles?.[0] || 'unknown',
      ipAddress: AuditLogHelper.extractIpAddress(request),
      userAgent: AuditLogHelper.extractUserAgent(request),
    });
  }

  @Post('definitions/:id/publish')
  @HttpCode(200)
  @Roles(...AdminPermissions.interactive.publish)
  @ApiOperation({ summary: 'Publish interactive definition' })
  @ApiResponse({ status: 200, description: 'Definition published' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async publishDefinition(@Param('id') id: string, @Req() request: any) {
    const user = request.user;
    await this.publishUseCase.execute(id, {
      userId: user.id,
      role: user.roles?.[0] || 'unknown',
      ipAddress: AuditLogHelper.extractIpAddress(request),
      userAgent: AuditLogHelper.extractUserAgent(request),
    });
  }

  @Get('definitions/:id/preview')
  @Roles(...AdminPermissions.interactive.get)
  @ApiOperation({ summary: 'Preview interactive definition (draft or published)' })
  @ApiResponse({ status: 200, description: 'Preview definition' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async previewDefinition(
    @Param('id') id: string,
    @Query('version') version?: 'draft' | 'published',
  ) {
    if (version === 'published') {
      const definition = await this.getPublishedByIdUseCase.execute(id);
      if (definition.status !== InteractiveStatus.PUBLISHED) {
        throw new NotFoundException('Published version not found');
      }
      return definition;
    }
    return await this.getByIdUseCase.execute(id);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @Roles(...AdminPermissions.interactive.publishDraft)
  @ApiOperation({ summary: 'Publish interactive definition (shortcut route)' })
  @ApiResponse({ status: 200, description: 'Definition published' })
  async publishDefinitionShortcut(@Param('id') id: string, @Req() request: any) {
    const user = request.user;
    await this.publishUseCase.execute(id, {
      userId: user.id,
      role: user.roles?.[0] || 'unknown',
      ipAddress: AuditLogHelper.extractIpAddress(request),
      userAgent: AuditLogHelper.extractUserAgent(request),
    });
  }

  @Get(':id/preview')
  @Roles(...AdminPermissions.interactive.get)
  @ApiOperation({ summary: 'Preview interactive definition (shortcut route)' })
  @ApiResponse({ status: 200, description: 'Preview definition' })
  async previewDefinitionShortcut(
    @Param('id') id: string,
    @Query('version') version?: 'draft' | 'published',
  ) {
    if (version === 'published') {
      const definition = await this.getPublishedByIdUseCase.execute(id);
      if (definition.status !== InteractiveStatus.PUBLISHED) {
        throw new NotFoundException('Published version not found');
      }
      return definition;
    }
    return await this.getByIdUseCase.execute(id);
  }

  @Get('definitions/:id/versions')
  @Roles(...AdminPermissions.interactive.get)
  @ApiOperation({ summary: 'List interactive definition versions' })
  @ApiResponse({ status: 200, description: 'List of versions' })
  async listVersions(@Param('id') id: string) {
    return await this.listVersionsUseCase.execute(id);
  }

  @Get('definitions/:id/versions/:version')
  @Roles(...AdminPermissions.interactive.get)
  @ApiOperation({ summary: 'Get interactive definition version' })
  @ApiResponse({ status: 200, description: 'Version details' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async getVersion(
    @Param('id') id: string,
    @Param('version') version: string,
  ) {
    return await this.getVersionUseCase.execute(id, Number(version));
  }

  // Navigator-specific endpoints (FEAT-INT-03)
  @Put('navigators/:id')
  @Roles(...AdminPermissions.interactive.update)
  @ApiOperation({ summary: 'Update navigator definition texts (structure cannot be changed in Release 1)' })
  @ApiResponse({ status: 200, description: 'Navigator updated' })
  @ApiResponse({ status: 404, description: 'Navigator not found' })
  @ApiResponse({ status: 400, description: 'Validation failed or structure change attempted' })
  async updateNavigator(
    @Param('id') id: string,
    @Body() dto: {
      title?: string;
      topicCode?: string | null;
      status?: InteractiveStatus;
      config?: InteractiveConfig;
    },
    @Req() request: any,
  ) {
    const user = request.user;
    await this.updateUseCase.execute(id, dto, {
      userId: user.id,
      role: user.roles?.[0] || 'unknown',
      ipAddress: AuditLogHelper.extractIpAddress(request),
      userAgent: AuditLogHelper.extractUserAgent(request),
    });
  }

  @Post('navigators/:id/publish')
  @HttpCode(200)
  @Roles(...AdminPermissions.interactive.publish)
  @ApiOperation({ summary: 'Publish navigator definition (validates structure)' })
  @ApiResponse({ status: 200, description: 'Navigator published' })
  @ApiResponse({ status: 404, description: 'Navigator not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async publishNavigator(@Param('id') id: string, @Req() request: any) {
    const user = request.user;
    await this.publishUseCase.execute(id, {
      userId: user.id,
      role: user.roles?.[0] || 'unknown',
      ipAddress: AuditLogHelper.extractIpAddress(request),
      userAgent: AuditLogHelper.extractUserAgent(request),
    });
  }

  @Get('navigators/:id/validate')
  @Roles(...AdminPermissions.interactive.get)
  @ApiOperation({ summary: 'Validate navigator draft definition' })
  @ApiResponse({ status: 200, description: 'Validation result' })
  async validateNavigator(@Param('id') id: string) {
    const definition = await this.getByIdUseCase.execute(id);
    if (!definition.config) {
      throw new NotFoundException('Navigator draft not found');
    }
    return await this.validateNavigatorUseCase.execute(definition.config as any);
  }
}

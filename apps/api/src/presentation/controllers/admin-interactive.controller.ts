import { Controller, Put, Body, Param, UseGuards, SetMetadata, Get, Query, Post } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UpdateInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/UpdateInteractiveDefinitionUseCase';
import { GetInteractiveDefinitionByIdUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveDefinitionByIdUseCase';
import { ListInteractiveDefinitionsUseCase } from '../../application/admin/use-cases/interactive/ListInteractiveDefinitionsUseCase';
import { PublishInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/PublishInteractiveDefinitionUseCase';
import { InteractiveConfig } from '../../domain/interactive/types/InteractiveConfig';
import { InteractiveStatus } from '../../domain/interactive/value-objects/InteractiveStatus';
import { InteractiveType } from '../../domain/interactive/value-objects/InteractiveType';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin-interactive')
@Controller('admin/interactive')
@UseGuards(AuthGuard, RolesGuard)
export class AdminInteractiveController {
  constructor(
    private readonly updateUseCase: UpdateInteractiveDefinitionUseCase,
    private readonly getByIdUseCase: GetInteractiveDefinitionByIdUseCase,
    private readonly listUseCase: ListInteractiveDefinitionsUseCase,
    private readonly publishUseCase: PublishInteractiveDefinitionUseCase,
  ) {}

  @Get('definitions')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'List interactive definitions' })
  @ApiResponse({ status: 200, description: 'List of definitions' })
  async listDefinitions(
    @Query('type') type?: InteractiveType,
    @Query('status') status?: InteractiveStatus,
  ) {
    return await this.listUseCase.execute({ type, status });
  }

  @Get('definitions/:id')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Get interactive definition by ID' })
  @ApiResponse({ status: 200, description: 'Definition details' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  async getDefinition(@Param('id') id: string) {
    return await this.getByIdUseCase.execute(id);
  }

  @Put('definitions/:id')
  @Roles('owner', 'editor')
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
  ) {
    await this.updateUseCase.execute(id, dto);
  }

  @Post('definitions/:id/publish')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Publish interactive definition' })
  @ApiResponse({ status: 200, description: 'Definition published' })
  @ApiResponse({ status: 404, description: 'Definition not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async publishDefinition(@Param('id') id: string) {
    await this.publishUseCase.execute(id);
  }

  // Navigator-specific endpoints (FEAT-INT-03)
  @Put('navigators/:id')
  @Roles('owner', 'editor')
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
  ) {
    await this.updateUseCase.execute(id, dto);
  }

  @Post('navigators/:id/publish')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Publish navigator definition (validates structure)' })
  @ApiResponse({ status: 200, description: 'Navigator published' })
  @ApiResponse({ status: 404, description: 'Navigator not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async publishNavigator(@Param('id') id: string) {
    await this.publishUseCase.execute(id);
  }
}

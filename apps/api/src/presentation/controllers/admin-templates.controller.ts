import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import {
  ActivateTemplateRequestDto,
  CreateTemplateRequestDto,
  CreateTemplateVersionRequestDto,
  ListTemplatesRequestDto,
  PreviewTemplateRequestDto,
  RollbackTemplateRequestDto,
} from '../../application/admin/dto/templates.dto';
import { ListTemplatesUseCase } from '../../application/admin/use-cases/templates/ListTemplatesUseCase';
import { GetTemplateUseCase } from '../../application/admin/use-cases/templates/GetTemplateUseCase';
import { CreateTemplateUseCase } from '../../application/admin/use-cases/templates/CreateTemplateUseCase';
import { CreateTemplateVersionUseCase } from '../../application/admin/use-cases/templates/CreateTemplateVersionUseCase';
import { PreviewTemplateUseCase } from '../../application/admin/use-cases/templates/PreviewTemplateUseCase';
import { ActivateTemplateUseCase } from '../../application/admin/use-cases/templates/ActivateTemplateUseCase';
import { RollbackTemplateUseCase } from '../../application/admin/use-cases/templates/RollbackTemplateUseCase';

@ApiTags('admin')
@Controller('admin/templates')
@UseGuards(AuthGuard, RolesGuard)
export class AdminTemplatesController {
  constructor(
    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    private readonly getTemplateUseCase: GetTemplateUseCase,
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly createTemplateVersionUseCase: CreateTemplateVersionUseCase,
    private readonly previewTemplateUseCase: PreviewTemplateUseCase,
    private readonly activateTemplateUseCase: ActivateTemplateUseCase,
    private readonly rollbackTemplateUseCase: RollbackTemplateUseCase,
  ) {}

  @Get()
  @Roles(...AdminPermissions.templates.list)
  @ApiOperation({ summary: 'List message templates' })
  @ApiResponse({ status: 200, description: 'Templates list' })
  async list(@Query() query: ListTemplatesRequestDto) {
    return this.listTemplatesUseCase.execute(query);
  }

  @Get(':id')
  @Roles(...AdminPermissions.templates.get)
  @ApiOperation({ summary: 'Get template details' })
  @ApiResponse({ status: 200, description: 'Template details' })
  async get(@Param('id') id: string) {
    return this.getTemplateUseCase.execute(id);
  }

  @Post()
  @Roles(...AdminPermissions.templates.create)
  @ApiOperation({ summary: 'Create template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  async create(@Body() dto: CreateTemplateRequestDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    if (!actorUserId) {
      throw new BadRequestException('User not found');
    }
    return this.createTemplateUseCase.execute(dto, actorUserId);
  }

  @Post(':id/versions')
  @Roles(...AdminPermissions.templates.createVersion)
  @ApiOperation({ summary: 'Create template version' })
  @ApiResponse({ status: 201, description: 'Version created' })
  async createVersion(
    @Param('id') id: string,
    @Body() dto: CreateTemplateVersionRequestDto,
    @Request() req: any,
  ) {
    const actorUserId = req.user?.id;
    if (!actorUserId) {
      throw new BadRequestException('User not found');
    }
    return this.createTemplateVersionUseCase.execute(id, dto, actorUserId);
  }

  @Post(':id/preview')
  @Roles(...AdminPermissions.templates.preview)
  @ApiOperation({ summary: 'Preview template' })
  @ApiResponse({ status: 200, description: 'Preview rendered' })
  async preview(@Param('id') id: string, @Body() dto: PreviewTemplateRequestDto) {
    return this.previewTemplateUseCase.execute(id, dto);
  }

  @Post(':id/activate')
  @Roles(...AdminPermissions.templates.activate)
  @ApiOperation({ summary: 'Activate template version' })
  @ApiResponse({ status: 200, description: 'Template activated' })
  async activate(@Param('id') id: string, @Body() dto: ActivateTemplateRequestDto, @Request() req: any) {
    const actorUserId = req.user?.id ?? null;
    const actorRole = req.user?.roles?.[0] ?? 'owner';
    return this.activateTemplateUseCase.execute(id, dto.version_id ?? null, actorUserId, actorRole);
  }

  @Post(':id/rollback')
  @Roles(...AdminPermissions.templates.rollback)
  @ApiOperation({ summary: 'Rollback template version' })
  @ApiResponse({ status: 201, description: 'Rollback version created' })
  async rollback(@Param('id') id: string, @Body() dto: RollbackTemplateRequestDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    if (!actorUserId) {
      throw new BadRequestException('User not found');
    }
    return this.rollbackTemplateUseCase.execute(id, dto.version_id, actorUserId);
  }
}

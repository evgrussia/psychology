import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { CreateContentItemUseCase } from '../../application/admin/use-cases/CreateContentItemUseCase';
import { UpdateContentItemUseCase } from '../../application/admin/use-cases/UpdateContentItemUseCase';
import { ListContentItemsUseCase, ListContentItemsFilters } from '../../application/admin/use-cases/ListContentItemsUseCase';
import { GetContentItemUseCase } from '../../application/admin/use-cases/GetContentItemUseCase';
import { ListTopicsUseCase } from '../../application/admin/use-cases/ListTopicsUseCase';
import { ListTagsUseCase } from '../../application/admin/use-cases/ListTagsUseCase';
import { PublishContentItemUseCase, PublishContentItemRequest } from '../../application/admin/use-cases/PublishContentItemUseCase';
import { ArchiveContentItemUseCase } from '../../application/admin/use-cases/ArchiveContentItemUseCase';
import { ListContentRevisionsUseCase } from '../../application/admin/use-cases/ListContentRevisionsUseCase';
import { RollbackContentRevisionUseCase } from '../../application/admin/use-cases/RollbackContentRevisionUseCase';
import { CreateContentItemDto, UpdateContentItemDto } from '../../application/admin/dto/content.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin/content')
@ApiBearerAuth()
@Controller('admin/content')
@UseGuards(AuthGuard, RolesGuard)
export class AdminContentController {
  constructor(
    private readonly createContentItemUseCase: CreateContentItemUseCase,
    private readonly updateContentItemUseCase: UpdateContentItemUseCase,
    private readonly listContentItemsUseCase: ListContentItemsUseCase,
    private readonly getContentItemUseCase: GetContentItemUseCase,
    private readonly listTopicsUseCase: ListTopicsUseCase,
    private readonly listTagsUseCase: ListTagsUseCase,
    private readonly publishContentItemUseCase: PublishContentItemUseCase,
    private readonly archiveContentItemUseCase: ArchiveContentItemUseCase,
    private readonly listContentRevisionsUseCase: ListContentRevisionsUseCase,
    private readonly rollbackContentRevisionUseCase: RollbackContentRevisionUseCase,
  ) {}

  @Get('topics')
  @Roles(...AdminPermissions.content.list)
  @ApiOperation({ summary: 'List all topics' })
  async listTopics() {
    return this.listTopicsUseCase.execute();
  }

  @Get('tags')
  @Roles(...AdminPermissions.content.list)
  @ApiOperation({ summary: 'List all tags' })
  async listTags() {
    return this.listTagsUseCase.execute();
  }

  @Get()
  @Roles(...AdminPermissions.content.list)
  @ApiOperation({ summary: 'List all content items' })
  async list(@Query() filters: ListContentItemsFilters) {
    return this.listContentItemsUseCase.execute(filters);
  }

  @Get(':id')
  @Roles(...AdminPermissions.content.get)
  @ApiOperation({ summary: 'Get content item by ID' })
  async get(@Param('id') id: string) {
    return this.getContentItemUseCase.execute(id);
  }

  @Post()
  @Roles(...AdminPermissions.content.create)
  @ApiOperation({ summary: 'Create new content item' })
  async create(@Body() dto: CreateContentItemDto, @Request() req: any) {
    const authorUserId = req.user.id;
    return this.createContentItemUseCase.execute(dto, authorUserId);
  }

  @Put(':id')
  @Roles(...AdminPermissions.content.update)
  @ApiOperation({ summary: 'Update content item' })
  async update(@Param('id') id: string, @Body() dto: UpdateContentItemDto, @Request() req: any) {
    const actorUserId = req.user.id;
    return this.updateContentItemUseCase.execute(id, dto, actorUserId);
  }

  @Post(':id/publish')
  @Roles(...AdminPermissions.content.publish)
  @ApiOperation({ summary: 'Publish content item with QA checklist' })
  async publish(@Param('id') id: string, @Body() request: PublishContentItemRequest) {
    return this.publishContentItemUseCase.execute(id, request);
  }

  @Post(':id/archive')
  @Roles(...AdminPermissions.content.archive)
  @ApiOperation({ summary: 'Archive content item' })
  async archive(@Param('id') id: string) {
    return this.archiveContentItemUseCase.execute(id);
  }

  @Get(':id/revisions')
  @Roles(...AdminPermissions.content.revisions)
  @ApiOperation({ summary: 'List content item revisions' })
  async listRevisions(@Param('id') id: string) {
    return this.listContentRevisionsUseCase.execute(id);
  }

  @Post(':id/revisions/:revisionId/rollback')
  @Roles(...AdminPermissions.content.rollback)
  @ApiOperation({ summary: 'Rollback to a specific revision' })
  async rollback(@Param('id') id: string, @Param('revisionId') revisionId: string) {
    return this.rollbackContentRevisionUseCase.execute(id, revisionId);
  }
}

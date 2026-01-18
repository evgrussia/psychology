import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ListGlossaryTermsUseCase } from '../../application/admin/use-cases/ListGlossaryTermsUseCase';
import { GetGlossaryTermUseCase } from '../../application/admin/use-cases/GetGlossaryTermUseCase';
import { UpsertGlossaryTermUseCase } from '../../application/admin/use-cases/UpsertGlossaryTermUseCase';
import { PublishGlossaryTermUseCase } from '../../application/admin/use-cases/PublishGlossaryTermUseCase';
import { DeleteGlossaryTermUseCase } from '../../application/admin/use-cases/DeleteGlossaryTermUseCase';
import { UpsertGlossaryTermDto } from '../../application/admin/dto/glossary.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentStatus, GlossaryTermCategory } from '../../domain/content/value-objects/ContentEnums';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';

@ApiTags('admin/glossary')
@ApiBearerAuth()
@Controller('admin/glossary')
@UseGuards(AuthGuard, RolesGuard)
export class AdminGlossaryController {
  constructor(
    private readonly listGlossaryTermsUseCase: ListGlossaryTermsUseCase,
    private readonly getGlossaryTermUseCase: GetGlossaryTermUseCase,
    private readonly upsertGlossaryTermUseCase: UpsertGlossaryTermUseCase,
    private readonly publishGlossaryTermUseCase: PublishGlossaryTermUseCase,
    private readonly deleteGlossaryTermUseCase: DeleteGlossaryTermUseCase,
  ) {}

  @Get()
  @Roles(...AdminPermissions.glossary.list)
  @ApiOperation({ summary: 'List all glossary terms' })
  async list(@Query() filters: { status?: ContentStatus; category?: GlossaryTermCategory; search?: string }) {
    return this.listGlossaryTermsUseCase.execute(filters);
  }

  @Get(':id')
  @Roles(...AdminPermissions.glossary.get)
  @ApiOperation({ summary: 'Get glossary term by ID' })
  async get(@Param('id') id: string) {
    return this.getGlossaryTermUseCase.execute(id);
  }

  @Post()
  @Roles(...AdminPermissions.glossary.upsert)
  @ApiOperation({ summary: 'Create/Update glossary term' })
  async upsert(@Body() dto: UpsertGlossaryTermDto) {
    return this.upsertGlossaryTermUseCase.execute(dto);
  }

  @Post(':id/publish')
  @Roles(...AdminPermissions.glossary.publish)
  @ApiOperation({ summary: 'Publish glossary term' })
  async publish(@Param('id') id: string) {
    return this.publishGlossaryTermUseCase.execute(id);
  }

  @Delete(':id')
  @Roles(...AdminPermissions.glossary.delete)
  @ApiOperation({ summary: 'Delete glossary term' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.deleteGlossaryTermUseCase.execute(id, {
      actorUserId: req.user?.id ?? null,
      actorRole: req.user?.roles?.[0] ?? null,
      ipAddress: AuditLogHelper.extractIpAddress(req),
      userAgent: AuditLogHelper.extractUserAgent(req),
    });
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ListGlossaryTermsUseCase } from '../../application/admin/use-cases/ListGlossaryTermsUseCase';
import { GetGlossaryTermUseCase } from '../../application/admin/use-cases/GetGlossaryTermUseCase';
import { UpsertGlossaryTermUseCase } from '../../application/admin/use-cases/UpsertGlossaryTermUseCase';
import { PublishGlossaryTermUseCase } from '../../application/admin/use-cases/PublishGlossaryTermUseCase';
import { DeleteGlossaryTermUseCase } from '../../application/admin/use-cases/DeleteGlossaryTermUseCase';
import { UpsertGlossaryTermDto } from '../../application/admin/dto/glossary.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentStatus, GlossaryTermCategory } from '../../domain/content/value-objects/ContentEnums';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

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
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'List all glossary terms' })
  async list(@Query() filters: { status?: ContentStatus; category?: GlossaryTermCategory; search?: string }) {
    return this.listGlossaryTermsUseCase.execute(filters);
  }

  @Get(':id')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Get glossary term by ID' })
  async get(@Param('id') id: string) {
    return this.getGlossaryTermUseCase.execute(id);
  }

  @Post()
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Create/Update glossary term' })
  async upsert(@Body() dto: UpsertGlossaryTermDto) {
    return this.upsertGlossaryTermUseCase.execute(dto);
  }

  @Post(':id/publish')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Publish glossary term' })
  async publish(@Param('id') id: string) {
    return this.publishGlossaryTermUseCase.execute(id);
  }

  @Delete(':id')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Delete glossary term' })
  async delete(@Param('id') id: string) {
    return this.deleteGlossaryTermUseCase.execute(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ListCuratedCollectionsUseCase } from '@application/admin/use-cases/ListCuratedCollectionsUseCase';
import { GetCuratedCollectionUseCase } from '@application/admin/use-cases/GetCuratedCollectionUseCase';
import { UpsertCuratedCollectionUseCase } from '@application/admin/use-cases/UpsertCuratedCollectionUseCase';
import { PublishCuratedCollectionUseCase } from '@application/admin/use-cases/PublishCuratedCollectionUseCase';
import { ReorderCuratedItemsUseCase } from '@application/admin/use-cases/ReorderCuratedItemsUseCase';
import { AdminCuratedCollectionDto, UpsertCuratedCollectionDto, ReorderCuratedItemsDto } from '@application/admin/dto/curated.dto';

@ApiTags('admin-curated')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(...AdminPermissions.curated.list)
@Controller('admin/curated')
export class AdminCuratedController {
  constructor(
    private readonly listCurated: ListCuratedCollectionsUseCase,
    private readonly getCurated: GetCuratedCollectionUseCase,
    private readonly upsertCurated: UpsertCuratedCollectionUseCase,
    private readonly publishCurated: PublishCuratedCollectionUseCase,
    private readonly reorderItems: ReorderCuratedItemsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all curated collections for admin' })
  @ApiResponse({ status: 200, description: 'List of curated collections' })
  async list(): Promise<AdminCuratedCollectionDto[]> {
    return this.listCurated.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get curated collection by ID for admin' })
  @ApiResponse({ status: 200, description: 'Curated collection details' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  async get(@Param('id') id: string): Promise<AdminCuratedCollectionDto> {
    return this.getCurated.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update curated collection' })
  @ApiResponse({ status: 201, description: 'Collection ID' })
  async upsert(@Body() dto: UpsertCuratedCollectionDto): Promise<{ id: string }> {
    const id = await this.upsertCurated.execute(dto);
    return { id };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish curated collection' })
  @ApiResponse({ status: 200, description: 'Collection published' })
  async publish(@Param('id') id: string): Promise<void> {
    return this.publishCurated.execute(id);
  }

  @Post(':id/items/reorder')
  @ApiOperation({ summary: 'Reorder items in curated collection' })
  @ApiResponse({ status: 200, description: 'Items reordered' })
  async reorder(
    @Param('id') id: string,
    @Body() dto: ReorderCuratedItemsDto,
  ): Promise<void> {
    return this.reorderItems.execute(id, dto);
  }
}

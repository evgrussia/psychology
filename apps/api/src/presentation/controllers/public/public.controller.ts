import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetHomepageModelUseCase } from '../../../application/public/use-cases/GetHomepageModelUseCase';
import { GetPageBySlugUseCase, GetPageBySlugResponse } from '../../../application/public/use-cases/GetPageBySlugUseCase';
import { GetContentBySlugUseCase, GetContentBySlugResponse } from '../../../application/public/use-cases/GetContentBySlugUseCase';
import { ListContentItemsUseCase, ListContentItemsRequest, ListContentItemsResponse } from '../../../application/public/use-cases/ListContentItemsUseCase';
import { HomepageDto } from '../../../application/public/dto/homepage.dto';
import { ContentType } from '../../../domain/content/value-objects/ContentEnums';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly getHomepageModel: GetHomepageModelUseCase,
    private readonly getPageBySlug: GetPageBySlugUseCase,
    private readonly getContentBySlug: GetContentBySlugUseCase,
    private readonly listContentItems: ListContentItemsUseCase,
  ) {}

  @Get('homepage')
  @ApiOperation({ summary: 'Get homepage content' })
  @ApiResponse({ status: 200, description: 'Homepage content' })
  async getHomepage(@Query('locale') locale: string = 'ru'): Promise<HomepageDto> {
    return this.getHomepageModel.execute({ locale });
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get public page by slug' })
  @ApiResponse({ status: 200, description: 'Page content' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async getPage(@Param('slug') slug: string): Promise<GetPageBySlugResponse> {
    return this.getPageBySlug.execute({ slug });
  }

  @Get('content/:type')
  @ApiOperation({ summary: 'List public content items by type' })
  @ApiResponse({ status: 200, description: 'List of content items' })
  async listContent(
    @Param('type') type: ContentType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<ListContentItemsResponse> {
    return this.listContentItems.execute({
      type,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('content/:type/:slug')
  @ApiOperation({ summary: 'Get public content by type and slug' })
  @ApiResponse({ status: 200, description: 'Content details' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContent(
    @Param('type') type: ContentType,
    @Param('slug') slug: string,
  ): Promise<GetContentBySlugResponse> {
    return this.getContentBySlug.execute({ type, slug });
  }
}

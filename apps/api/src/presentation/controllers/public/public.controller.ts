import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetHomepageModelUseCase } from '../../../application/public/use-cases/GetHomepageModelUseCase';
import { GetPageBySlugUseCase, GetPageBySlugResponse } from '../../../application/public/use-cases/GetPageBySlugUseCase';
import { GetContentBySlugUseCase, GetContentBySlugResponse } from '../../../application/public/use-cases/GetContentBySlugUseCase';
import { ListContentItemsUseCase, ListContentItemsRequest, ListContentItemsResponse } from '../../../application/public/use-cases/ListContentItemsUseCase';
import { GetTopicsUseCase } from '../../../application/public/use-cases/GetTopicsUseCase';
import { GetTopicLandingUseCase } from '../../../application/public/use-cases/GetTopicLandingUseCase';
import { ListPublicGlossaryTermsUseCase } from '../../../application/public/use-cases/ListPublicGlossaryTermsUseCase';
import { GetPublicGlossaryTermUseCase } from '../../../application/public/use-cases/GetPublicGlossaryTermUseCase';
import { ListCuratedCollectionsUseCase } from '../../../application/public/use-cases/ListCuratedCollectionsUseCase';
import { GetCuratedCollectionUseCase } from '../../../application/public/use-cases/GetCuratedCollectionUseCase';
import { HomepageDto } from '../../../application/public/dto/homepage.dto';
import { TopicDto, TopicLandingDto } from '../../../application/public/dto/topics.dto';
import { PublicCuratedCollectionDto } from '../../../application/public/dto/curated.dto';
import { PublicGlossaryListItemDto, PublicGlossaryTermResponseDto } from '../../../application/public/dto/glossary.dto';
import { ContentType, GlossaryTermCategory } from '../../../domain/content/value-objects/ContentEnums';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly getHomepageModel: GetHomepageModelUseCase,
    private readonly getPageBySlug: GetPageBySlugUseCase,
    private readonly getContentBySlug: GetContentBySlugUseCase,
    private readonly listContentItems: ListContentItemsUseCase,
    private readonly getTopics: GetTopicsUseCase,
    private readonly getTopicLanding: GetTopicLandingUseCase,
    private readonly listCurated: ListCuratedCollectionsUseCase,
    private readonly getCurated: GetCuratedCollectionUseCase,
    private readonly listPublicGlossaryTerms: ListPublicGlossaryTermsUseCase,
    private readonly getPublicGlossaryTerm: GetPublicGlossaryTermUseCase,
  ) {}

  @Get('glossary')
  @ApiOperation({ summary: 'List all published glossary terms' })
  @ApiResponse({ status: 200, description: 'List of glossary terms' })
  async listGlossary(
    @Query('category') category?: GlossaryTermCategory,
    @Query('search') search?: string,
  ): Promise<PublicGlossaryListItemDto[]> {
    return this.listPublicGlossaryTerms.execute({ category, search });
  }

  @Get('glossary/:slug')
  @ApiOperation({ summary: 'Get published glossary term by slug' })
  @ApiResponse({ status: 200, description: 'Glossary term details' })
  @ApiResponse({ status: 404, description: 'Term not found' })
  async getGlossaryTerm(@Param('slug') slug: string): Promise<PublicGlossaryTermResponseDto> {
    return this.getPublicGlossaryTerm.execute(slug);
  }

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

  @Get('curated')
  @ApiOperation({ summary: 'List public curated collections' })
  @ApiResponse({ status: 200, description: 'List of curated collections' })
  async listCuratedCollections(): Promise<PublicCuratedCollectionDto[]> {
    return this.listCurated.execute();
  }

  @Get('curated/:slug')
  @ApiOperation({ summary: 'Get public curated collection by slug' })
  @ApiResponse({ status: 200, description: 'Curated collection details' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  async getCuratedCollection(@Param('slug') slug: string): Promise<PublicCuratedCollectionDto> {
    return this.getCurated.execute(slug);
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

  @Get('topics')
  @ApiOperation({ summary: 'Get all active topics' })
  @ApiResponse({ status: 200, description: 'List of topics', type: [TopicDto] })
  async listTopics(): Promise<TopicDto[]> {
    return this.getTopics.execute();
  }

  @Get('topic-landings/:topicSlug')
  @ApiOperation({ summary: 'Get topic landing page content' })
  @ApiResponse({ status: 200, description: 'Topic landing content', type: TopicLandingDto })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async getLanding(@Param('topicSlug') topicSlug: string): Promise<TopicLandingDto> {
    return this.getTopicLanding.execute({ topicSlug });
  }
}

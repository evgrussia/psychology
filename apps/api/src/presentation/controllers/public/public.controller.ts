import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
import { ListServicesUseCase } from '../../../application/public/use-cases/ListServicesUseCase';
import { GetServiceBySlugUseCase } from '../../../application/public/use-cases/GetServiceBySlugUseCase';
import { ListAvailableSlotsUseCase } from '../../../application/booking/use-cases/ListAvailableSlotsUseCase';
import { StartBookingUseCase } from '../../../application/booking/use-cases/StartBookingUseCase';
import { SubmitIntakeUseCase } from '../../../application/booking/use-cases/SubmitIntakeUseCase';
import { UpdateBookingConsentsUseCase } from '../../../application/booking/use-cases/UpdateBookingConsentsUseCase';
import { GetBookingStatusUseCase } from '../../../application/booking/use-cases/GetBookingStatusUseCase';
import { CreatePaymentUseCase, CreatePaymentRequestDto, CreatePaymentResponseDto } from '../../../application/booking/use-cases/CreatePaymentUseCase';
import { CreateWaitlistRequestUseCase } from '../../../application/booking/use-cases/CreateWaitlistRequestUseCase';
import { GetNoSlotsModelUseCase } from '../../../application/booking/use-cases/GetNoSlotsModelUseCase';
import { HomepageDto } from '../../../application/public/dto/homepage.dto';
import { TopicDto, TopicLandingDto } from '../../../application/public/dto/topics.dto';
import { PublicCuratedCollectionDto } from '../../../application/public/dto/curated.dto';
import { PublicGlossaryListItemDto, PublicGlossaryTermResponseDto } from '../../../application/public/dto/glossary.dto';
import { ServiceDetailsDto, ServiceListItemDto } from '../../../application/public/dto/services.dto';
import { ListAvailableSlotsResponseDto } from '../../../application/booking/dto/availability.dto';
import {
  BookingStatusResponseDto,
  StartBookingRequestDto,
  StartBookingResponseDto,
  SubmitIntakeRequestDto,
  SubmitIntakeResponseDto,
  UpdateBookingConsentsRequestDto,
  UpdateBookingConsentsResponseDto,
} from '../../../application/booking/dto/booking.dto';
import { CreateWaitlistRequestDto, CreateWaitlistResponseDto } from '../../../application/booking/dto/waitlist.dto';
import { NoSlotsModelDto } from '../../../application/booking/dto/no-slots.dto';
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
    private readonly listServices: ListServicesUseCase,
    private readonly getServiceBySlug: GetServiceBySlugUseCase,
    private readonly listAvailableSlotsUseCase: ListAvailableSlotsUseCase,
    private readonly startBookingUseCase: StartBookingUseCase,
    private readonly submitIntakeUseCase: SubmitIntakeUseCase,
    private readonly updateBookingConsentsUseCase: UpdateBookingConsentsUseCase,
    private readonly getBookingStatusUseCase: GetBookingStatusUseCase,
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly createWaitlistRequestUseCase: CreateWaitlistRequestUseCase,
    private readonly getNoSlotsModelUseCase: GetNoSlotsModelUseCase,
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

  @Get('services')
  @ApiOperation({ summary: 'List published services' })
  @ApiResponse({ status: 200, description: 'List of services' })
  async listPublishedServices(): Promise<ServiceListItemDto[]> {
    return this.listServices.execute();
  }

  @Get('services/:slug')
  @ApiOperation({ summary: 'Get published service by slug' })
  @ApiResponse({ status: 200, description: 'Service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getService(@Param('slug') slug: string): Promise<ServiceDetailsDto> {
    return this.getServiceBySlug.execute(slug);
  }

  @Get('booking/slots')
  @ApiOperation({ summary: 'List available booking slots' })
  @ApiResponse({ status: 200, description: 'List of available slots' })
  async listAvailableSlots(
    @Query('service_slug') serviceSlug?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tz') timezone?: string,
  ): Promise<ListAvailableSlotsResponseDto> {
    if (!serviceSlug || !from || !to || !timezone) {
      throw new BadRequestException('Missing required query parameters');
    }

    return this.listAvailableSlotsUseCase.execute({
      serviceSlug,
      from,
      to,
      timezone,
    });
  }

  @Get('booking/no-slots')
  @ApiOperation({ summary: 'Get booking no-slots page model' })
  @ApiResponse({ status: 200, description: 'No slots page model' })
  async getNoSlotsModel(
    @Query('service_slug') serviceSlug?: string,
  ): Promise<NoSlotsModelDto> {
    return this.getNoSlotsModelUseCase.execute(serviceSlug);
  }

  @Post('waitlist')
  @ApiOperation({ summary: 'Create waitlist request' })
  @ApiResponse({ status: 201, description: 'Waitlist request created' })
  async createWaitlist(
    @Body() dto: CreateWaitlistRequestDto,
  ): Promise<CreateWaitlistResponseDto> {
    return this.createWaitlistRequestUseCase.execute(dto);
  }

  @Post('booking/start')
  @ApiOperation({ summary: 'Start booking and reserve slot' })
  @ApiResponse({ status: 201, description: 'Booking started' })
  async startBooking(@Body() dto: StartBookingRequestDto): Promise<StartBookingResponseDto> {
    return this.startBookingUseCase.execute(dto);
  }

  @Post('booking/:id/intake')
  @ApiOperation({ summary: 'Submit intake form for appointment' })
  @ApiResponse({ status: 201, description: 'Intake submitted' })
  async submitIntake(
    @Param('id') appointmentId: string,
    @Body() dto: SubmitIntakeRequestDto,
  ): Promise<SubmitIntakeResponseDto> {
    return this.submitIntakeUseCase.execute(appointmentId, dto);
  }

  @Post('booking/:id/consents')
  @ApiOperation({ summary: 'Update consents for booking' })
  @ApiResponse({ status: 201, description: 'Consents updated' })
  async updateBookingConsents(
    @Param('id') appointmentId: string,
    @Body() dto: UpdateBookingConsentsRequestDto,
  ): Promise<UpdateBookingConsentsResponseDto> {
    return this.updateBookingConsentsUseCase.execute(appointmentId, dto);
  }

  @Get('booking/:id/status')
  @ApiOperation({ summary: 'Get booking status' })
  @ApiResponse({ status: 200, description: 'Booking status' })
  async getBookingStatus(@Param('id') appointmentId: string): Promise<BookingStatusResponseDto> {
    return this.getBookingStatusUseCase.execute(appointmentId);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create payment for appointment' })
  @ApiResponse({ status: 200, description: 'Payment created' })
  async createPayment(@Body() dto: CreatePaymentRequestDto): Promise<CreatePaymentResponseDto> {
    return this.createPaymentUseCase.execute(dto);
  }

}

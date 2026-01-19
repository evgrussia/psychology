import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListPublicEventsUseCase } from '@application/public/use-cases/events/ListPublicEventsUseCase';
import { GetPublicEventUseCase } from '@application/public/use-cases/events/GetPublicEventUseCase';
import { RegisterForPublicEventUseCase, RegisterForPublicEventDto } from '@application/public/use-cases/events/RegisterForPublicEventUseCase';

@ApiTags('public/events')
@Controller('public/events')
export class PublicEventsController {
  constructor(
    private readonly listUseCase: ListPublicEventsUseCase,
    private readonly getUseCase: GetPublicEventUseCase,
    private readonly registerUseCase: RegisterForPublicEventUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List public events' })
  @ApiResponse({ status: 200 })
  async list() {
    return this.listUseCase.execute();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get public event by slug' })
  @ApiResponse({ status: 200 })
  async get(@Param('slug') slug: string) {
    return this.getUseCase.execute(slug);
  }

  @Post(':slug/register')
  @ApiOperation({ summary: 'Register for an event (public)' })
  @ApiResponse({ status: 201 })
  async register(@Param('slug') slug: string, @Body() dto: RegisterForPublicEventDto) {
    return this.registerUseCase.execute(slug, dto);
  }
}


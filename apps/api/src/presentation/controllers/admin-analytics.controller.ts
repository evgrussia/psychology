import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { GetAdminBookingFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminBookingFunnelUseCase';
import { GetAdminTelegramFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminTelegramFunnelUseCase';
import { GetAdminInteractiveFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminInteractiveFunnelUseCase';
import { GetAdminNoShowStatsUseCase } from '../../application/admin/use-cases/analytics/GetAdminNoShowStatsUseCase';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin-analytics')
@Controller('admin/analytics')
@UseGuards(AuthGuard, RolesGuard)
export class AdminAnalyticsController {
  constructor(
    private readonly getAdminBookingFunnelUseCase: GetAdminBookingFunnelUseCase,
    private readonly getAdminTelegramFunnelUseCase: GetAdminTelegramFunnelUseCase,
    private readonly getAdminInteractiveFunnelUseCase: GetAdminInteractiveFunnelUseCase,
    private readonly getAdminNoShowStatsUseCase: GetAdminNoShowStatsUseCase,
  ) {}

  @Get('funnels/booking')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get booking funnel analytics' })
  @ApiResponse({ status: 200, description: 'Booking funnel data' })
  async getBookingFunnel(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('topic') topic?: string,
    @Query('service_slug') serviceSlug?: string,
  ) {
    return this.getAdminBookingFunnelUseCase.execute(
      { range, from, to },
      { topic, serviceSlug },
    );
  }

  @Get('funnels/telegram')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get telegram funnel analytics' })
  @ApiResponse({ status: 200, description: 'Telegram funnel data' })
  async getTelegramFunnel(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('topic') topic?: string,
    @Query('tg_flow') tgFlow?: string,
  ) {
    return this.getAdminTelegramFunnelUseCase.execute(
      { range, from, to },
      { topic, tgFlow },
    );
  }

  @Get('funnels/interactive')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get interactive funnel analytics' })
  @ApiResponse({ status: 200, description: 'Interactive funnel data' })
  async getInteractiveFunnel(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('topic') topic?: string,
  ) {
    return this.getAdminInteractiveFunnelUseCase.execute(
      { range, from, to },
      { topic },
    );
  }

  @Get('no-show')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get no-show analytics' })
  @ApiResponse({ status: 200, description: 'No-show data' })
  async getNoShowStats(
    @Query('range') range?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('topic') topic?: string,
    @Query('service_slug') serviceSlug?: string,
  ) {
    return this.getAdminNoShowStatsUseCase.execute(
      { range, from, to },
      { topic, serviceSlug },
    );
  }
}

import { Body, Controller, Get, Patch, Post, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ConnectGoogleCalendarUseCase } from '../../application/integrations/use-cases/ConnectGoogleCalendarUseCase';
import { GetGoogleCalendarStatusUseCase } from '../../application/integrations/use-cases/GetGoogleCalendarStatusUseCase';
import { SyncCalendarBusyTimesUseCase } from '../../application/integrations/use-cases/SyncCalendarBusyTimesUseCase';
import { ConfigService } from '@nestjs/config';
import { DisconnectGoogleCalendarUseCase } from '../../application/integrations/use-cases/DisconnectGoogleCalendarUseCase';
import { UpdateSystemSettingsUseCase } from '../../application/admin/use-cases/UpdateSystemSettingsUseCase';

const DEFAULT_SYNC_LOOKAHEAD_DAYS = 30;

@ApiTags('admin')
@Controller('admin/integrations/google-calendar')
@UseGuards(AuthGuard, RolesGuard)
export class AdminGoogleCalendarController {
  constructor(
    private readonly connectGoogleCalendarUseCase: ConnectGoogleCalendarUseCase,
    private readonly getGoogleCalendarStatusUseCase: GetGoogleCalendarStatusUseCase,
    private readonly syncCalendarBusyTimesUseCase: SyncCalendarBusyTimesUseCase,
    private readonly disconnectGoogleCalendarUseCase: DisconnectGoogleCalendarUseCase,
    private readonly updateSystemSettingsUseCase: UpdateSystemSettingsUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Get('status')
  @Roles(...AdminPermissions.googleCalendar.status)
  @ApiOperation({ summary: 'Get Google Calendar integration status' })
  @ApiResponse({ status: 200, description: 'Return Google Calendar integration status' })
  async getStatus() {
    return this.getGoogleCalendarStatusUseCase.execute();
  }

  @Post('connect')
  @Roles(...AdminPermissions.googleCalendar.connectStart)
  @ApiOperation({ summary: 'Start Google Calendar OAuth connection' })
  @ApiResponse({ status: 200, description: 'Return Google OAuth authorization URL' })
  async startConnect(@Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = req.ip;
    const userAgent = req.headers?.['user-agent'];

    return this.connectGoogleCalendarUseCase.startConnection(actorUserId, actorRole, ipAddress, userAgent);
  }

  @Get('callback')
  @Roles(...AdminPermissions.googleCalendar.connectCallback)
  @ApiOperation({ summary: 'Complete Google Calendar OAuth connection' })
  @ApiResponse({ status: 200, description: 'Return updated integration status' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Request() req: any,
  ) {
    if (!code || !state) {
      throw new BadRequestException('Missing OAuth code or state');
    }

    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = req.ip;
    const userAgent = req.headers?.['user-agent'];

    return this.connectGoogleCalendarUseCase.completeConnection(
      code,
      state,
      actorUserId,
      actorRole,
      ipAddress,
      userAgent,
    );
  }

  @Post('sync')
  @Roles(...AdminPermissions.googleCalendar.sync)
  @ApiOperation({ summary: 'Sync Google Calendar busy intervals' })
  @ApiResponse({ status: 200, description: 'Return sync status' })
  async syncBusyTimes(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : new Date();
    const lookaheadDays = this.configService.get<number>('GOOGLE_CALENDAR_SYNC_LOOKAHEAD_DAYS') || DEFAULT_SYNC_LOOKAHEAD_DAYS;
    const toDate = to ? new Date(to) : new Date(fromDate.getTime() + lookaheadDays * 24 * 60 * 60 * 1000);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid sync range');
    }

    return this.syncCalendarBusyTimesUseCase.execute({ from: fromDate, to: toDate });
  }

  @Post('disconnect')
  @Roles(...AdminPermissions.googleCalendar.disconnect)
  @ApiOperation({ summary: 'Disconnect Google Calendar integration' })
  async disconnect() {
    return this.disconnectGoogleCalendarUseCase.execute();
  }

  @Patch('sync-mode')
  @Roles(...AdminPermissions.googleCalendar.updateSyncMode)
  @ApiOperation({ summary: 'Update Google Calendar sync mode' })
  async updateSyncMode(@Body() body: { sync_mode: string }, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    return this.updateSystemSettingsUseCase.execute(
      { googleCalendarSyncMode: body.sync_mode },
      actorUserId,
      actorRole,
    );
  }
}

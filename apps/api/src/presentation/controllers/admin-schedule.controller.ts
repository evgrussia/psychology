import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminPermissions } from '../permissions/admin-permissions';
import { ListScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/ListScheduleSlotsUseCase';
import { ListScheduleAppointmentsUseCase } from '../../application/admin/use-cases/schedule/ListScheduleAppointmentsUseCase';
import { CreateScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/CreateScheduleSlotsUseCase';
import { UpdateScheduleSlotUseCase } from '../../application/admin/use-cases/schedule/UpdateScheduleSlotUseCase';
import { DeleteScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/DeleteScheduleSlotsUseCase';
import { GetScheduleSettingsUseCase } from '../../application/admin/use-cases/schedule/GetScheduleSettingsUseCase';
import { UpdateScheduleSettingsUseCase } from '../../application/admin/use-cases/schedule/UpdateScheduleSettingsUseCase';
import { CancelAppointmentUseCase } from '../../application/admin/use-cases/schedule/CancelAppointmentUseCase';
import { RecordAppointmentOutcomeUseCase } from '../../application/admin/use-cases/schedule/RecordAppointmentOutcomeUseCase';
import {
  CreateScheduleSlotsRequestDto,
  DeleteScheduleSlotsRequestDto,
  RecordAppointmentOutcomeRequestDto,
  UpdateScheduleSettingsRequestDto,
  UpdateScheduleSlotRequestDto,
} from '../../application/admin/dto/schedule.dto';
import { ScheduleBlockType, SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';

@ApiTags('admin')
@Controller('admin/schedule')
@UseGuards(AuthGuard, RolesGuard)
export class AdminScheduleController {
  constructor(
    private readonly listScheduleSlotsUseCase: ListScheduleSlotsUseCase,
    private readonly listScheduleAppointmentsUseCase: ListScheduleAppointmentsUseCase,
    private readonly createScheduleSlotsUseCase: CreateScheduleSlotsUseCase,
    private readonly updateScheduleSlotUseCase: UpdateScheduleSlotUseCase,
    private readonly deleteScheduleSlotsUseCase: DeleteScheduleSlotsUseCase,
    private readonly getScheduleSettingsUseCase: GetScheduleSettingsUseCase,
    private readonly updateScheduleSettingsUseCase: UpdateScheduleSettingsUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly recordAppointmentOutcomeUseCase: RecordAppointmentOutcomeUseCase,
  ) {}

  @Get('slots')
  @Roles(...AdminPermissions.schedule.listSlots)
  @ApiOperation({ summary: 'List schedule slots' })
  @ApiResponse({ status: 200, description: 'List schedule slots' })
  async listSlots(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('service_id') serviceId?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.listScheduleSlotsUseCase.execute({
      from: from || new Date().toISOString(),
      to: to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      serviceId: serviceId ?? undefined,
      statuses: status ? status.split(',') : undefined,
      sources: source ? source.split(',') : undefined,
    });
  }

  @Get('appointments')
  @Roles(...AdminPermissions.schedule.listAppointments)
  @ApiOperation({ summary: 'List appointments for schedule' })
  @ApiResponse({ status: 200, description: 'List appointments' })
  async listAppointments(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.listScheduleAppointmentsUseCase.execute({
      from: from || new Date().toISOString(),
      to: to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  @Post('slots')
  @Roles(...AdminPermissions.schedule.createSlots)
  @ApiOperation({ summary: 'Create available schedule slots' })
  @ApiResponse({ status: 201, description: 'Slots created' })
  async createSlots(@Body() dto: CreateScheduleSlotsRequestDto) {
    return this.createScheduleSlotsUseCase.execute({
      request: dto,
      status: SlotStatus.available,
      source: SlotSource.product,
      blockType: null,
    });
  }

  @Post('exceptions')
  @Roles(...AdminPermissions.schedule.createExceptions)
  @ApiOperation({ summary: 'Create schedule exceptions (blocked)' })
  @ApiResponse({ status: 201, description: 'Exceptions created' })
  async createExceptions(@Body() dto: CreateScheduleSlotsRequestDto) {
    return this.createScheduleSlotsUseCase.execute({
      request: dto,
      status: SlotStatus.blocked,
      source: SlotSource.product,
      blockType: ScheduleBlockType.exception,
    });
  }

  @Post('buffers')
  @Roles(...AdminPermissions.schedule.createBuffers)
  @ApiOperation({ summary: 'Create schedule buffers (blocked)' })
  @ApiResponse({ status: 201, description: 'Buffers created' })
  async createBuffers(@Body() dto: CreateScheduleSlotsRequestDto) {
    return this.createScheduleSlotsUseCase.execute({
      request: dto,
      status: SlotStatus.blocked,
      source: SlotSource.product,
      blockType: ScheduleBlockType.buffer,
    });
  }

  @Put('slots/:id')
  @Roles(...AdminPermissions.schedule.updateSlot)
  @ApiOperation({ summary: 'Update schedule slot' })
  @ApiResponse({ status: 200, description: 'Slot updated' })
  async updateSlot(
    @Param('id') slotId: string,
    @Body() dto: UpdateScheduleSlotRequestDto,
  ) {
    await this.updateScheduleSlotUseCase.execute(slotId, dto);
    return { status: 'ok' };
  }

  @Delete('slots')
  @Roles(...AdminPermissions.schedule.deleteSlots)
  @ApiOperation({ summary: 'Delete schedule slots' })
  @ApiResponse({ status: 200, description: 'Slots deleted' })
  async deleteSlots(@Body() dto: DeleteScheduleSlotsRequestDto, @Request() req: any) {
    return this.deleteScheduleSlotsUseCase.execute(dto.slot_ids, {
      actorUserId: req.user?.id ?? null,
      actorRole: req.user?.roles?.[0] ?? null,
      ipAddress: AuditLogHelper.extractIpAddress(req),
      userAgent: AuditLogHelper.extractUserAgent(req),
    });
  }

  @Get('settings')
  @Roles(...AdminPermissions.schedule.getSettings)
  @ApiOperation({ summary: 'Get schedule settings' })
  @ApiResponse({ status: 200, description: 'Schedule settings' })
  async getSettings() {
    return this.getScheduleSettingsUseCase.execute();
  }

  @Put('settings')
  @Roles(...AdminPermissions.schedule.updateSettings)
  @ApiOperation({ summary: 'Update schedule settings' })
  @ApiResponse({ status: 200, description: 'Schedule settings updated' })
  async updateSettings(@Body() dto: UpdateScheduleSettingsRequestDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    await this.updateScheduleSettingsUseCase.execute(dto, actorUserId, actorRole);
    return { status: 'ok' };
  }

  @Post('appointments/:id/cancel')
  @Roles(...AdminPermissions.schedule.cancelAppointment)
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment canceled' })
  async cancelAppointment(@Param('id') appointmentId: string, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    await this.cancelAppointmentUseCase.execute(appointmentId, actorUserId, actorRole);
    return { status: 'ok' };
  }

  @Post('appointments/:id/outcome')
  @Roles(...AdminPermissions.schedule.recordOutcome)
  @ApiOperation({ summary: 'Record appointment outcome' })
  @ApiResponse({ status: 200, description: 'Outcome recorded' })
  async recordOutcome(
    @Param('id') appointmentId: string,
    @Body() dto: RecordAppointmentOutcomeRequestDto,
    @Request() req: any,
  ) {
    const actorRole = req.user?.roles?.[0] || 'owner';
    await this.recordAppointmentOutcomeUseCase.execute({
      appointmentId,
      outcome: dto.outcome,
      reasonCategory: dto.reason_category ?? null,
      recordedByRole: actorRole,
    });
    return { status: 'ok' };
  }
}

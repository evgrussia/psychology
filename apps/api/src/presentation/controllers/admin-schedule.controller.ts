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
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ListScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/ListScheduleSlotsUseCase';
import { ListScheduleAppointmentsUseCase } from '../../application/admin/use-cases/schedule/ListScheduleAppointmentsUseCase';
import { CreateScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/CreateScheduleSlotsUseCase';
import { UpdateScheduleSlotUseCase } from '../../application/admin/use-cases/schedule/UpdateScheduleSlotUseCase';
import { DeleteScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/DeleteScheduleSlotsUseCase';
import { GetScheduleSettingsUseCase } from '../../application/admin/use-cases/schedule/GetScheduleSettingsUseCase';
import { UpdateScheduleSettingsUseCase } from '../../application/admin/use-cases/schedule/UpdateScheduleSettingsUseCase';
import { CancelAppointmentUseCase } from '../../application/admin/use-cases/schedule/CancelAppointmentUseCase';
import {
  CreateScheduleSlotsRequestDto,
  DeleteScheduleSlotsRequestDto,
  UpdateScheduleSettingsRequestDto,
  UpdateScheduleSlotRequestDto,
} from '../../application/admin/dto/schedule.dto';
import { ScheduleBlockType, SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

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
  ) {}

  @Get('slots')
  @Roles('owner', 'assistant')
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
  @Roles('owner', 'assistant')
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
  @Roles('owner', 'assistant')
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
  @Roles('owner', 'assistant')
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
  @Roles('owner', 'assistant')
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
  @Roles('owner', 'assistant')
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
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Delete schedule slots' })
  @ApiResponse({ status: 200, description: 'Slots deleted' })
  async deleteSlots(@Body() dto: DeleteScheduleSlotsRequestDto) {
    return this.deleteScheduleSlotsUseCase.execute(dto.slot_ids);
  }

  @Get('settings')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get schedule settings' })
  @ApiResponse({ status: 200, description: 'Schedule settings' })
  async getSettings() {
    return this.getScheduleSettingsUseCase.execute();
  }

  @Put('settings')
  @Roles('owner')
  @ApiOperation({ summary: 'Update schedule settings' })
  @ApiResponse({ status: 200, description: 'Schedule settings updated' })
  async updateSettings(@Body() dto: UpdateScheduleSettingsRequestDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    await this.updateScheduleSettingsUseCase.execute(dto, actorUserId, actorRole);
    return { status: 'ok' };
  }

  @Post('appointments/:id/cancel')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment canceled' })
  async cancelAppointment(@Param('id') appointmentId: string, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    await this.cancelAppointmentUseCase.execute(appointmentId, actorUserId, actorRole);
    return { status: 'ok' };
  }
}

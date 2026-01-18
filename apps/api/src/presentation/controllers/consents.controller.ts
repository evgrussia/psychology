import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UpdateCabinetConsentsUseCase } from '@application/cabinet/use-cases/UpdateCabinetConsentsUseCase';
import { GetCabinetConsentsUseCase } from '@application/cabinet/use-cases/GetCabinetConsentsUseCase';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';
import { CabinetConsentsDto, UpdateCabinetConsentsRequestDto, UpdateCabinetConsentsResponseDto } from '@application/cabinet/dto/cabinet.dto';

@ApiTags('consents')
@Controller('consents')
@UseGuards(AuthGuard, RolesGuard)
@Roles('client')
export class ConsentsController {
  constructor(
    private readonly updateCabinetConsentsUseCase: UpdateCabinetConsentsUseCase,
    private readonly getCabinetConsentsUseCase: GetCabinetConsentsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user consents' })
  @ApiResponse({ status: 200, description: 'Return current consents' })
  async getConsents(@Req() req: any): Promise<CabinetConsentsDto> {
    return this.getCabinetConsentsUseCase.execute(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user consents' })
  @ApiResponse({ status: 200, description: 'Return updated consents' })
  async updateConsents(
    @Req() req: any,
    @Body() dto: UpdateCabinetConsentsRequestDto,
  ): Promise<UpdateCabinetConsentsResponseDto> {
    return this.updateCabinetConsentsUseCase.execute(req.user.id, dto, {
      actorUserId: req.user.id,
      actorRole: req.user.roles?.[0] ?? 'client',
      ipAddress: AuditLogHelper.extractIpAddress(req),
      userAgent: AuditLogHelper.extractUserAgent(req),
    });
  }
}

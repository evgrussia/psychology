import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, StreamableFile, UseGuards, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ListClientAppointmentsUseCase } from '@application/cabinet/use-cases/ListClientAppointmentsUseCase';
import { ListClientMaterialsUseCase } from '@application/cabinet/use-cases/ListClientMaterialsUseCase';
import {
  CabinetAppointmentsResponseDto,
  CabinetMaterialsResponseDto,
  CabinetProfileDto,
  CreateDiaryEntryRequestDto,
  CreateDiaryEntryResponseDto,
  DeleteDiaryEntryResponseDto,
  DeleteAccountResponseDto,
  ExportDiaryPdfRequestDto,
  ExportAccountDataRequestDto,
  UpdateCabinetConsentsRequestDto,
  UpdateCabinetConsentsResponseDto,
  CabinetConsentsDto,
  ListDiaryEntriesResponseDto,
} from '@application/cabinet/dto/cabinet.dto';
import { CreateDiaryEntryUseCase } from '@application/cabinet/use-cases/CreateDiaryEntryUseCase';
import { ListDiaryEntriesUseCase } from '@application/cabinet/use-cases/ListDiaryEntriesUseCase';
import { DeleteDiaryEntryUseCase } from '@application/cabinet/use-cases/DeleteDiaryEntryUseCase';
import { ExportDiaryPdfUseCase } from '@application/cabinet/use-cases/ExportDiaryPdfUseCase';
import { ExportAccountDataUseCase } from '@application/cabinet/use-cases/ExportAccountDataUseCase';
import { UpdateCabinetConsentsUseCase } from '@application/cabinet/use-cases/UpdateCabinetConsentsUseCase';
import { GetCabinetConsentsUseCase } from '@application/cabinet/use-cases/GetCabinetConsentsUseCase';
import { DeleteAccountUseCase } from '@application/cabinet/use-cases/DeleteAccountUseCase';
import { AuditLogHelper } from '@application/audit/helpers/audit-log.helper';

@ApiTags('cabinet')
@Controller('cabinet')
@UseGuards(AuthGuard, RolesGuard)
@Roles('client')
export class CabinetController {
  constructor(
    private readonly listClientAppointmentsUseCase: ListClientAppointmentsUseCase,
    private readonly listClientMaterialsUseCase: ListClientMaterialsUseCase,
    private readonly createDiaryEntryUseCase: CreateDiaryEntryUseCase,
    private readonly listDiaryEntriesUseCase: ListDiaryEntriesUseCase,
    private readonly deleteDiaryEntryUseCase: DeleteDiaryEntryUseCase,
    private readonly exportDiaryPdfUseCase: ExportDiaryPdfUseCase,
    private readonly exportAccountDataUseCase: ExportAccountDataUseCase,
    private readonly updateCabinetConsentsUseCase: UpdateCabinetConsentsUseCase,
    private readonly getCabinetConsentsUseCase: GetCabinetConsentsUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current client profile' })
  @ApiResponse({ status: 200, description: 'Return client profile' })
  async getProfile(@Req() req: any): Promise<CabinetProfileDto> {
    return {
      id: req.user.id,
      email: req.user.email,
      display_name: req.user.displayName ?? null,
      roles: req.user.roles ?? [],
    };
  }

  @Get('appointments')
  @ApiOperation({ summary: 'List client appointments' })
  @ApiResponse({ status: 200, description: 'Return client appointments' })
  async getAppointments(@Req() req: any): Promise<CabinetAppointmentsResponseDto> {
    return this.listClientAppointmentsUseCase.execute(req.user.id);
  }

  @Get('materials')
  @ApiOperation({ summary: 'List client materials' })
  @ApiResponse({ status: 200, description: 'Return client materials' })
  async getMaterials(@Req() req: any): Promise<CabinetMaterialsResponseDto> {
    return this.listClientMaterialsUseCase.execute(req.user.id);
  }

  @Post('diary')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create diary entry' })
  @ApiResponse({ status: 201, description: 'Diary entry created' })
  async createDiaryEntry(
    @Req() req: any,
    @Body() dto: CreateDiaryEntryRequestDto,
  ): Promise<CreateDiaryEntryResponseDto> {
    return this.createDiaryEntryUseCase.execute(req.user.id, dto);
  }

  @Get('diary')
  @ApiOperation({ summary: 'List diary entries' })
  @ApiResponse({ status: 200, description: 'Return diary entries' })
  async listDiaryEntries(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ListDiaryEntriesResponseDto> {
    return this.listDiaryEntriesUseCase.execute(req.user.id, {
      diaryType: type ?? null,
      from: from ?? null,
      to: to ?? null,
    });
  }

  @Delete('diary/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete diary entry' })
  @ApiResponse({ status: 200, description: 'Diary entry deleted' })
  async deleteDiaryEntry(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<DeleteDiaryEntryResponseDto> {
    return this.deleteDiaryEntryUseCase.execute(req.user.id, id);
  }

  @Post('diary/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export diary entries to PDF' })
  @ApiResponse({ status: 200, description: 'Return diary export PDF' })
  async exportDiaryPdf(
    @Req() req: any,
    @Body() dto: ExportDiaryPdfRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, filename } = await this.exportDiaryPdfUseCase.execute(req.user.id, dto);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    return new StreamableFile(buffer);
  }

  @Get('consents')
  @ApiOperation({ summary: 'Get current client consents' })
  @ApiResponse({ status: 200, description: 'Return client consents' })
  async getConsents(@Req() req: any): Promise<CabinetConsentsDto> {
    return this.getCabinetConsentsUseCase.execute(req.user.id);
  }

  @Post('consents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update client consents' })
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

  @Post('data/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export account data' })
  @ApiResponse({ status: 200, description: 'Return account data export' })
  async exportAccountData(
    @Req() req: any,
    @Body() dto: ExportAccountDataRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const result = await this.exportAccountDataUseCase.execute(req.user.id, dto, {
      actorUserId: req.user.id,
      actorRole: req.user.roles?.[0] ?? 'client',
      ipAddress: AuditLogHelper.extractIpAddress(req),
      userAgent: AuditLogHelper.extractUserAgent(req),
    });

    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Cache-Control': 'no-store',
    });

    return new StreamableFile(result.buffer);
  }

  @Post('account/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete client account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  async deleteAccount(@Req() req: any): Promise<DeleteAccountResponseDto> {
    return this.deleteAccountUseCase.execute(req.user.id, {
      actorUserId: req.user.id,
      actorRole: req.user.roles?.[0] ?? 'client',
      ipAddress: AuditLogHelper.extractIpAddress(req),
      userAgent: AuditLogHelper.extractUserAgent(req),
    });
  }
}

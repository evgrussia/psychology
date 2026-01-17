import { Body, Controller, Get, HttpCode, Param, Post, Query, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ListModerationItemsUseCase } from '../../application/admin/use-cases/moderation/ListModerationItemsUseCase';
import { GetModerationItemUseCase } from '../../application/admin/use-cases/moderation/GetModerationItemUseCase';
import { ApproveModerationItemUseCase } from '../../application/admin/use-cases/moderation/ApproveModerationItemUseCase';
import { RejectModerationItemUseCase } from '../../application/admin/use-cases/moderation/RejectModerationItemUseCase';
import { EscalateModerationItemUseCase } from '../../application/admin/use-cases/moderation/EscalateModerationItemUseCase';
import { AnswerModerationItemUseCase } from '../../application/admin/use-cases/moderation/AnswerModerationItemUseCase';
import { ListModerationTemplatesUseCase } from '../../application/admin/use-cases/moderation/ListModerationTemplatesUseCase';
import { GetModerationMetricsUseCase } from '../../application/admin/use-cases/moderation/GetModerationMetricsUseCase';
import {
  AnswerModerationItemDto,
  EscalateModerationItemDto,
  ListModerationItemsQueryDto,
  ModerationMetricsQueryDto,
  RejectModerationItemDto,
} from '../../application/admin/dto/moderation.dto';
import { AuditLogHelper } from '../../application/audit/helpers/audit-log.helper';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin/moderation')
@Controller('admin/moderation')
@UseGuards(AuthGuard, RolesGuard)
export class AdminModerationController {
  constructor(
    private readonly listModerationItemsUseCase: ListModerationItemsUseCase,
    private readonly getModerationItemUseCase: GetModerationItemUseCase,
    private readonly approveModerationItemUseCase: ApproveModerationItemUseCase,
    private readonly rejectModerationItemUseCase: RejectModerationItemUseCase,
    private readonly escalateModerationItemUseCase: EscalateModerationItemUseCase,
    private readonly answerModerationItemUseCase: AnswerModerationItemUseCase,
    private readonly listModerationTemplatesUseCase: ListModerationTemplatesUseCase,
    private readonly getModerationMetricsUseCase: GetModerationMetricsUseCase,
  ) {}

  @Get('items')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'List moderation queue items' })
  @ApiResponse({ status: 200, description: 'Moderation items list' })
  async list(@Query() query: ListModerationItemsQueryDto) {
    return this.listModerationItemsUseCase.execute(query);
  }

  @Get('items/:id')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get moderation item details' })
  @ApiResponse({ status: 200, description: 'Moderation item details' })
  async getItem(@Param('id') id: string) {
    return this.getModerationItemUseCase.execute(id);
  }

  @Post('items/:id/approve')
  @HttpCode(200)
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Approve moderation item' })
  @ApiResponse({ status: 200, description: 'Item approved' })
  async approve(@Param('id') id: string, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = AuditLogHelper.extractIpAddress(req);
    const userAgent = AuditLogHelper.extractUserAgent(req);
    await this.approveModerationItemUseCase.execute(id, actorUserId, actorRole, ipAddress, userAgent);
    return { status: 'ok' };
  }

  @Post('items/:id/reject')
  @HttpCode(200)
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Reject moderation item' })
  @ApiResponse({ status: 200, description: 'Item rejected' })
  async reject(@Param('id') id: string, @Body() dto: RejectModerationItemDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = AuditLogHelper.extractIpAddress(req);
    const userAgent = AuditLogHelper.extractUserAgent(req);
    await this.rejectModerationItemUseCase.execute(
      id,
      dto.reasonCategory,
      actorUserId,
      actorRole,
      ipAddress,
      userAgent,
    );
    return { status: 'ok' };
  }

  @Post('items/:id/escalate')
  @HttpCode(200)
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Escalate moderation item' })
  @ApiResponse({ status: 200, description: 'Item escalated' })
  async escalate(@Param('id') id: string, @Body() dto: EscalateModerationItemDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = AuditLogHelper.extractIpAddress(req);
    const userAgent = AuditLogHelper.extractUserAgent(req);
    await this.escalateModerationItemUseCase.execute(
      id,
      dto.reasonCategory,
      actorUserId,
      actorRole,
      ipAddress,
      userAgent,
    );
    return { status: 'ok' };
  }

  @Post('items/:id/answer')
  @HttpCode(200)
  @Roles('owner')
  @ApiOperation({ summary: 'Publish answer for moderation item' })
  @ApiResponse({ status: 200, description: 'Answer published' })
  async answer(@Param('id') id: string, @Body() dto: AnswerModerationItemDto, @Request() req: any) {
    const actorUserId = req.user?.id;
    const actorRole = req.user?.roles?.[0] || 'owner';
    const ipAddress = AuditLogHelper.extractIpAddress(req);
    const userAgent = AuditLogHelper.extractUserAgent(req);
    await this.answerModerationItemUseCase.execute(id, dto.text, actorUserId, actorRole, ipAddress, userAgent);
    return { status: 'ok' };
  }

  @Get('templates')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'List moderation message templates' })
  @ApiResponse({ status: 200, description: 'Moderation templates list' })
  async listTemplates() {
    return this.listModerationTemplatesUseCase.execute();
  }

  @Get('metrics')
  @Roles('owner', 'assistant')
  @ApiOperation({ summary: 'Get moderation metrics' })
  @ApiResponse({ status: 200, description: 'Moderation metrics' })
  async metrics(@Query() query: ModerationMetricsQueryDto) {
    return this.getModerationMetricsUseCase.execute(query);
  }
}

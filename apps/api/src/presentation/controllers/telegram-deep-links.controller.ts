import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResolveDeepLinkUseCase } from '@application/telegram/use-cases/ResolveDeepLinkUseCase';
import { ResolveDeepLinkResponseDto } from '@application/telegram/dto/deep-links.dto';
import { TelegramServiceGuard } from '../guards/telegram-service.guard';

@ApiTags('telegram')
@Controller('telegram/deep-links')
export class TelegramDeepLinksController {
  constructor(private readonly resolveDeepLinkUseCase: ResolveDeepLinkUseCase) {}

  @Get(':id')
  @UseGuards(TelegramServiceGuard)
  @ApiOperation({ summary: 'Resolve deep link payload for Telegram service' })
  @ApiResponse({ status: 200, description: 'Deep link payload resolved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Deep link not found or expired' })
  async resolveDeepLink(@Param('id') id: string): Promise<ResolveDeepLinkResponseDto> {
    return this.resolveDeepLinkUseCase.execute(id);
  }
}

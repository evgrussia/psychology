import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiNextStepRequestDto, AiNextStepResponseDto } from '@application/ai/dto/next-step.dto';
import { AiConciergeRequestDto, AiConciergeResponseDto } from '@application/ai/dto/concierge.dto';
import { GetAiNextStepUseCase } from '@application/ai/use-cases/GetAiNextStepUseCase';
import { GetAiConciergeUseCase } from '@application/ai/use-cases/GetAiConciergeUseCase';

@ApiTags('public')
@Controller('public/ai')
export class PublicAiController {
  constructor(
    private readonly getAiNextStepUseCase: GetAiNextStepUseCase,
    private readonly getAiConciergeUseCase: GetAiConciergeUseCase,
  ) {}

  @Post('next-step')
  @ApiOperation({ summary: 'Get AI-guided next-step suggestions (safety-first)' })
  @ApiResponse({ status: 200, description: 'Next-step guidance response' })
  async nextStep(@Body() dto: AiNextStepRequestDto): Promise<AiNextStepResponseDto> {
    return this.getAiNextStepUseCase.execute(dto);
  }

  @Post('concierge')
  @ApiOperation({ summary: 'Get booking concierge guidance (service-only)' })
  @ApiResponse({ status: 200, description: 'Concierge guidance response' })
  async concierge(@Body() dto: AiConciergeRequestDto): Promise<AiConciergeResponseDto> {
    return this.getAiConciergeUseCase.execute(dto);
  }
}

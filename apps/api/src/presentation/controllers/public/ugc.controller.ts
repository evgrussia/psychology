import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubmitAnonymousQuestionUseCase } from '../../../application/public/use-cases/SubmitAnonymousQuestionUseCase';
import { GetAnonymousQuestionStatusUseCase } from '../../../application/public/use-cases/GetAnonymousQuestionStatusUseCase';
import {
  SubmitAnonymousQuestionRequestDto,
  SubmitAnonymousQuestionResponseDto,
  AnonymousQuestionStatusResponseDto,
} from '../../../application/public/dto/ugc.dto';

@ApiTags('public/ugc')
@Controller('public/ugc')
export class PublicUgcController {
  constructor(
    private readonly submitAnonymousQuestionUseCase: SubmitAnonymousQuestionUseCase,
    private readonly getAnonymousQuestionStatusUseCase: GetAnonymousQuestionStatusUseCase,
  ) {}

  @Post('questions')
  @ApiOperation({ summary: 'Submit anonymous question' })
  @ApiResponse({ status: 201, description: 'Question submitted' })
  async submitQuestion(
    @Body() dto: SubmitAnonymousQuestionRequestDto,
  ): Promise<SubmitAnonymousQuestionResponseDto> {
    return this.submitAnonymousQuestionUseCase.execute(dto);
  }

  @Get('questions/status/:id')
  @ApiOperation({ summary: 'Get anonymous question status' })
  @ApiResponse({ status: 200, description: 'Question status' })
  async getStatus(@Param('id') id: string): Promise<AnonymousQuestionStatusResponseDto> {
    return this.getAnonymousQuestionStatusUseCase.execute(id);
  }
}

import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetExperimentAssignmentUseCase } from '@application/experiments/use-cases/GetExperimentAssignmentUseCase';
import { ListExperimentsUseCase } from '@application/experiments/use-cases/ListExperimentsUseCase';
import { ExperimentAssignmentRequestDto, ExperimentAssignmentResponseDto, ExperimentListItemDto } from '@application/experiments/dto/experiments.dto';

@ApiTags('experiments')
@Controller('public/experiments')
export class ExperimentsController {
  constructor(
    private readonly getExperimentAssignmentUseCase: GetExperimentAssignmentUseCase,
    private readonly listExperimentsUseCase: ListExperimentsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List experiment definitions' })
  @ApiResponse({ status: 200, description: 'Experiment catalog' })
  async list(): Promise<ExperimentListItemDto[]> {
    return this.listExperimentsUseCase.execute();
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign experiment variant for a subject' })
  @ApiResponse({ status: 200, description: 'Experiment assignment result' })
  @HttpCode(200)
  async assign(@Body() dto: ExperimentAssignmentRequestDto): Promise<ExperimentAssignmentResponseDto> {
    return this.getExperimentAssignmentUseCase.execute(dto);
  }
}

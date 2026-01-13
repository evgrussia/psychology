import { Controller, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { StartInteractiveRunUseCase } from '../../application/interactive/use-cases/StartInteractiveRunUseCase';
import { CompleteInteractiveRunUseCase } from '../../application/interactive/use-cases/CompleteInteractiveRunUseCase';
import { StartInteractiveRunDto, CompleteInteractiveRunDto } from '../../application/interactive/dto/interactive-run.dto';

@Controller('public/interactive')
export class InteractiveController {
  constructor(
    private readonly startRunUseCase: StartInteractiveRunUseCase,
    private readonly completeRunUseCase: CompleteInteractiveRunUseCase,
  ) {}

  @Post('runs')
  @HttpCode(HttpStatus.CREATED)
  async startRun(@Body() dto: StartInteractiveRunDto) {
    return await this.startRunUseCase.execute(dto);
  }

  @Post('runs/:id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async completeRun(@Param('id') id: string, @Body() dto: CompleteInteractiveRunDto) {
    await this.completeRunUseCase.execute({
      runId: id,
      ...dto,
    });
  }
}

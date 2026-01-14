import { Controller, Post, Body, Param, HttpCode, HttpStatus, Get, Query, ForbiddenException } from '@nestjs/common';
import { StartInteractiveRunUseCase } from '../../application/interactive/use-cases/StartInteractiveRunUseCase';
import { CompleteInteractiveRunUseCase } from '../../application/interactive/use-cases/CompleteInteractiveRunUseCase';
import { GetBoundaryScriptsUseCase } from '../../application/interactive/use-cases/GetBoundaryScriptsUseCase';
import { GetNavigatorDefinitionUseCase } from '../../application/interactive/use-cases/GetNavigatorDefinitionUseCase';
import { ListRitualsUseCase } from '../../application/interactive/use-cases/ListRitualsUseCase';
import { GetRitualUseCase } from '../../application/interactive/use-cases/GetRitualUseCase';
import { GetInteractiveDefinitionUseCase } from '../../application/interactive/use-cases/GetInteractiveDefinitionUseCase';
import { StartInteractiveRunDto, CompleteInteractiveRunDto } from '../../application/interactive/dto/interactive-run.dto';
import { InteractiveType } from '../../domain/interactive/value-objects/InteractiveType';

@Controller('public/interactive')
export class InteractiveController {
  constructor(
    private readonly startRunUseCase: StartInteractiveRunUseCase,
    private readonly completeRunUseCase: CompleteInteractiveRunUseCase,
    private readonly getBoundaryScriptsUseCase: GetBoundaryScriptsUseCase,
    private readonly getNavigatorUseCase: GetNavigatorDefinitionUseCase,
    private readonly listRitualsUseCase: ListRitualsUseCase,
    private readonly getRitualUseCase: GetRitualUseCase,
    private readonly getInteractiveDefinitionUseCase: GetInteractiveDefinitionUseCase,
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

  @Get('boundaries-scripts/:slug')
  async getBoundaryScripts(@Param('slug') slug: string) {
    return await this.getBoundaryScriptsUseCase.execute({ slug });
  }

  @Get('navigators/:slug')
  async getNavigator(@Param('slug') slug: string) {
    // Check feature flag (FEAT-INT-03, section 11)
    const navigatorEnabled = process.env.NAVIGATOR_ENABLED !== 'false'; // Defaults to true
    if (!navigatorEnabled) {
      throw new ForbiddenException('Navigator feature is currently disabled');
    }
    return await this.getNavigatorUseCase.execute({ slug });
  }

  @Get('quizzes/:slug')
  async getQuiz(@Param('slug') slug: string) {
    return await this.getInteractiveDefinitionUseCase.execute(InteractiveType.QUIZ, slug);
  }

  @Get('rituals')
  async listRituals(@Query('topic') topicCode?: string) {
    return await this.listRitualsUseCase.execute({ topicCode });
  }

  @Get('rituals/:slug')
  async getRitual(@Param('slug') slug: string) {
    return await this.getRitualUseCase.execute(slug);
  }
}

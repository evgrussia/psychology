import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListRitualsUseCase } from '../../application/interactive/use-cases/ListRitualsUseCase';
import { GetRitualUseCase } from '../../application/interactive/use-cases/GetRitualUseCase';

@Controller('public')
export class PublicRitualsController {
  constructor(
    private readonly listRitualsUseCase: ListRitualsUseCase,
    private readonly getRitualUseCase: GetRitualUseCase,
  ) {}

  @Get('rituals')
  async listRituals(@Query('topic') topicCode?: string) {
    return await this.listRitualsUseCase.execute({ topicCode });
  }

  @Get('rituals/:slug')
  async getRitual(@Param('slug') slug: string) {
    return await this.getRitualUseCase.execute(slug);
  }
}

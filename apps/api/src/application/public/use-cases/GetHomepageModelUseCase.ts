import { Inject, Injectable } from '@nestjs/common';
import { ITopicRepository } from '../../../domain/content/repositories/ITopicRepository';
import { IInteractiveDefinitionRepository } from '../../../domain/interactive/repositories/IInteractiveDefinitionRepository';
import { HomepageDto, TrustBlockDto } from '../dto/homepage.dto';

@Injectable()
export class GetHomepageModelUseCase {
  constructor(
    @Inject('ITopicRepository')
    private readonly topicRepository: ITopicRepository,
    @Inject('IInteractiveDefinitionRepository')
    private readonly interactiveRepository: IInteractiveDefinitionRepository,
  ) {}

  async execute(params: { locale: string }): Promise<HomepageDto> {
    const topics = await this.topicRepository.findAllActive();
    const interactives = await this.interactiveRepository.findPublished();

    // Trust blocks are currently static content as per PRD/IA
    const trustBlocks: TrustBlockDto[] = [
      {
        id: 'confidentiality',
        title: 'Конфиденциальность',
        description: 'Ваши данные и содержание бесед остаются строго между нами. Я следую этическому кодексу психолога.',
        icon: 'lock',
      },
      {
        id: 'how_it_works',
        title: 'Как проходит консультация',
        description: 'Обычно это 50-минутная встреча в уютном кабинете или онлайн. Мы обсуждаем ваш запрос и ищем пути решения.',
        icon: 'heart',
      },
      {
        id: 'boundaries',
        title: 'Профессиональные границы',
        description: 'Я не даю советов и не принимаю решений за вас. Мы работаем в партнерстве для вашего роста.',
        icon: 'shield',
      },
    ];

    return {
      topics: topics.map(t => ({ code: t.code, title: t.title })),
      featured_interactives: interactives.map(i => ({
        id: i.id,
        type: i.type,
        slug: i.slug,
        title: i.title,
        topicCode: i.topicCode,
      })),
      trust_blocks: trustBlocks,
    };
  }
}

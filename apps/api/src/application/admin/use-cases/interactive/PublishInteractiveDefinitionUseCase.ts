import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IInteractiveDefinitionRepository } from '@domain/interactive/repositories/IInteractiveDefinitionRepository';
import { InteractiveStatus } from '@domain/interactive/value-objects/InteractiveStatus';
import { InteractiveDefinition } from '@domain/interactive/entities/InteractiveDefinition';
import { InteractiveType } from '@domain/interactive/value-objects/InteractiveType';
import { QuizConfig, NavigatorConfig } from '@domain/interactive/types/InteractiveConfig';
import { ValidateNavigatorDefinitionUseCase } from '../../../interactive/use-cases/ValidateNavigatorDefinitionUseCase';

@Injectable()
export class PublishInteractiveDefinitionUseCase {
  constructor(
    @Inject('IInteractiveDefinitionRepository')
    private readonly definitionRepository: IInteractiveDefinitionRepository,
    private readonly validateNavigatorUseCase: ValidateNavigatorDefinitionUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const definition = await this.definitionRepository.findById(id);

    if (!definition) {
      throw new NotFoundException(`Interactive definition with ID ${id} not found`);
    }

    // Validate quiz config before publishing
    if (definition.type === InteractiveType.QUIZ && definition.config) {
      this.validateQuizConfig(definition.config as QuizConfig);
    }

    // Validate navigator config before publishing
    if (definition.type === InteractiveType.NAVIGATOR && definition.config) {
      await this.validateNavigatorConfig(definition.config as NavigatorConfig);
    }

    const publishedDefinition = InteractiveDefinition.reconstitute({
      id: definition.id,
      type: definition.type,
      slug: definition.slug,
      title: definition.title,
      topicCode: definition.topicCode,
      status: InteractiveStatus.PUBLISHED,
      config: definition.config,
      publishedAt: new Date(),
    });

    await this.definitionRepository.save(publishedDefinition);
  }

  private validateQuizConfig(config: QuizConfig) {
    if (!config.questions || config.questions.length === 0) {
      throw new BadRequestException('Quiz must have at least one question before publishing');
    }

    if (!config.thresholds || config.thresholds.length === 0) {
      throw new BadRequestException('Quiz must have thresholds defined before publishing');
    }

    if (!config.results || config.results.length === 0) {
      throw new BadRequestException('Quiz must have results defined before publishing');
    }

    // Check for threshold overlaps
    const sortedThresholds = [...config.thresholds].sort((a, b) => a.minScore - b.minScore);
    for (let i = 0; i < sortedThresholds.length - 1; i++) {
      if (sortedThresholds[i].maxScore >= sortedThresholds[i + 1].minScore) {
        throw new BadRequestException(`Cannot publish: threshold overlap detected between ${sortedThresholds[i].level} and ${sortedThresholds[i + 1].level}`);
      }
    }
  }

  private async validateNavigatorConfig(config: NavigatorConfig): Promise<void> {
    const validationResult = await this.validateNavigatorUseCase.execute(config);
    if (!validationResult.isValid) {
      throw new BadRequestException(`Cannot publish navigator: ${validationResult.errors.join(', ')}`);
    }
  }
}

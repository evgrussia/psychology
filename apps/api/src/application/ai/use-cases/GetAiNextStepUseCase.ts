import { Inject, Injectable } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ITopicRepository } from '@domain/content/repositories/ITopicRepository';
import { ContentStatus, ContentType, TimeToBenefit } from '@domain/content/value-objects/ContentEnums';
import { AiSafetyPolicy } from '@domain/ai/services/AiSafetyPolicy';
import { AiNextStepRequestDto, AiNextStepResponseDto, NextStepGoal, NextStepTimeToBenefit } from '../dto/next-step.dto';
import { buildCrisisResponse, buildRefusalResponse, getDefaultDisclaimer } from '../helpers/ai-responses';

@Injectable()
export class GetAiNextStepUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepository: IContentItemRepository,
    @Inject('ITopicRepository')
    private readonly topicRepository: ITopicRepository,
  ) {}

  async execute(dto: AiNextStepRequestDto): Promise<AiNextStepResponseDto> {
    const safety = new AiSafetyPolicy().evaluate({
      surface: 'next_step',
      ageConfirmed: dto.age_confirmed,
      consentSensitive: dto.consent_sensitive_text,
      text: dto.free_text,
    });

    if (dto.answers.safety === 'unsafe') {
      return buildCrisisResponse('panic_like', 'next_step');
    }

    if (safety.status === 'crisis') {
      return buildCrisisResponse(safety.crisisTrigger ?? 'panic_like', 'next_step');
    }

    if (safety.status === 'refuse') {
      return buildRefusalResponse(safety.refusalReason ?? 'out_of_scope');
    }

    const topic = dto.answers.topic_code
      ? await this.topicRepository.findByCode(dto.answers.topic_code)
      : null;

    const contentItems = dto.answers.topic_code
      ? await this.contentItemRepository.findByTopic(dto.answers.topic_code, {
          status: ContentStatus.published,
        })
      : await this.contentItemRepository.findAll({ status: ContentStatus.published });

    const articles = contentItems.filter((item) => item.contentType === ContentType.article);
    const resources = contentItems.filter((item) => item.contentType === ContentType.resource);

    const preferredTime = this.mapTime(dto.answers.time_to_benefit);
    const pickByTime = (items: typeof articles) => {
      const exact = items.filter((item) => item.timeToBenefit === preferredTime);
      return (exact.length > 0 ? exact : items).slice(0, 2);
    };

    const selectedArticles = pickByTime(articles).map((item) => ({
      title: item.title,
      href: `/blog/${item.slug}`,
    }));

    const selectedResources = pickByTime(resources).map((item) => ({
      title: item.title,
      href: `/resources/${item.slug}`,
    }));

    const steps = this.composeSteps(dto.answers.goal);

    return {
      status: 'ok',
      message: 'Вот безопасный следующий шаг на основе ваших ответов.',
      disclaimer: getDefaultDisclaimer(),
      recommendations: {
        topic: topic
          ? {
              code: topic.code,
              title: topic.title,
              href: `/s-chem-ya-pomogayu/${topic.code}`,
            }
          : undefined,
        articles: selectedArticles,
        resources: selectedResources,
      },
      next_steps: steps,
      cta: {
        primary: { label: 'Получить план в Telegram', href: 'telegram' },
        secondary: { label: 'Записаться', href: '/booking' },
      },
    };
  }

  private mapTime(value: NextStepTimeToBenefit): TimeToBenefit {
    switch (value) {
      case NextStepTimeToBenefit.min_1_3:
        return TimeToBenefit.min_1_3;
      case NextStepTimeToBenefit.min_7_10:
        return TimeToBenefit.min_7_10;
      case NextStepTimeToBenefit.min_20_30:
        return TimeToBenefit.min_20_30;
      case NextStepTimeToBenefit.series:
      default:
        return TimeToBenefit.series;
    }
  }

  private composeSteps(goal: NextStepGoal): { now: string[]; week: string[] } {
    if (goal === NextStepGoal.relief) {
      return {
        now: [
          'Сделайте короткую паузу на 2–3 минуты, чтобы выровнять дыхание.',
          'Выберите один небольшой шаг, который даст ощущение опоры прямо сейчас.',
        ],
        week: [
          'Попробуйте один ресурс 2–3 раза в течение недели.',
          'Если откликнется — запланируйте консультацию, чтобы углубить работу.',
        ],
      };
    }

    if (goal === NextStepGoal.decision) {
      return {
        now: [
          'Сформулируйте, что нужно решить в одном предложении.',
          'Выберите, что поможет: ясность, поддержка или действие.',
        ],
        week: [
          'Вернитесь к вопросу через 2–3 дня и посмотрите, что изменилось.',
          'Если нужна поддержка — запишитесь на встречу.',
        ],
      };
    }

    return {
      now: [
        'Выберите один материал, который даёт ясность и структуру.',
        'Отметьте, какие мысли или чувства стали чуть понятнее.',
      ],
      week: [
        'Сделайте 1–2 небольших шага из материалов.',
        'Если нужно, обсудите это с психологом на встрече.',
      ],
    };
  }
}

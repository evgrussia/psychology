import { Inject, Injectable } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { AiSafetyPolicy } from '@domain/ai/services/AiSafetyPolicy';
import { AiConciergeRequestDto, AiConciergeResponseDto, ConciergeFormatPreference, ConciergeGoal } from '../dto/concierge.dto';
import { buildCrisisResponse, buildRefusalResponse, getDefaultDisclaimer } from '../helpers/ai-responses';

@Injectable()
export class GetAiConciergeUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(dto: AiConciergeRequestDto): Promise<AiConciergeResponseDto> {
    const safety = new AiSafetyPolicy().evaluate({
      surface: 'concierge',
      ageConfirmed: dto.age_confirmed,
      consentSensitive: dto.consent_sensitive_text,
      text: dto.free_text,
    });

    if (safety.status === 'crisis') {
      return buildCrisisResponse(safety.crisisTrigger ?? 'panic_like', 'concierge');
    }

    if (safety.status === 'refuse') {
      return buildRefusalResponse(safety.refusalReason ?? 'out_of_scope');
    }

    const services = await this.serviceRepository.findAll(ServiceStatus.published);
    const filteredByFormat = this.filterByFormat(services, dto.answers.format_preference);
    const picked = this.pickService(filteredByFormat, dto.answers.goal) || filteredByFormat[0] || services[0];

    const handoffNeeded = dto.answers.goal === ConciergeGoal.ongoing_support && !picked;

    return {
      status: 'ok',
      message: 'Я помогу подобрать удобный способ записи и следующий шаг.',
      disclaimer: getDefaultDisclaimer(),
      recommendation: picked
        ? {
            service: {
              slug: picked.slug,
              title: picked.title,
              href: `/services/${picked.slug}`,
              format: picked.format,
              duration_minutes: picked.durationMinutes,
              price_amount: picked.priceAmount,
            },
            next_steps: [
              'Перейдите к записи, чтобы выбрать удобное время.',
              'Если нет слотов, мы предложим лист ожидания или альтернативы.',
            ],
          }
        : undefined,
      handoff: handoffNeeded
        ? {
            reason: 'Нужна помощь специалиста для уточнения запроса.',
            actions: [
              { label: 'Записаться на консультацию', href: '/booking' },
              { label: 'Написать в Telegram', href: 'telegram' },
            ],
          }
        : undefined,
      cta: {
        primary: { label: 'Перейти к записи', href: '/booking' },
        secondary: { label: 'Написать в Telegram', href: 'telegram' },
      },
    };
  }

  private filterByFormat(services: any[], preference: ConciergeFormatPreference) {
    if (preference === ConciergeFormatPreference.any) {
      return services;
    }
    return services.filter((service) => service.format === preference || service.format === 'hybrid');
  }

  private pickService(services: any[], goal: ConciergeGoal) {
    if (!services || services.length === 0) return null;
    if (goal === ConciergeGoal.first_meeting) {
      return services.find((service) => service.slug.includes('intro')) || services[0];
    }
    if (goal === ConciergeGoal.single_session) {
      return services.find((service) => service.slug.includes('full') || service.slug.includes('session')) || services[0];
    }
    return services[0];
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { IUgcModerationRepository } from '@domain/moderation/repositories/IUgcModerationRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { UgcStatus, UgcTriggerFlag } from '@domain/moderation/value-objects/ModerationEnums';
import { SubmitAnonymousQuestionRequestDto, SubmitAnonymousQuestionResponseDto } from '../dto/ugc.dto';

@Injectable()
export class SubmitAnonymousQuestionUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(dto: SubmitAnonymousQuestionRequestDto): Promise<SubmitAnonymousQuestionResponseDto> {
    const triggerFlags = this.detectTriggers(dto.text);
    const status = triggerFlags.length > 0 ? UgcStatus.flagged : UgcStatus.pending;
    const encryptedText = this.encryptionService.encrypt(dto.text);
    const encryptedContact = dto.contactValue ? this.encryptionService.encrypt(dto.contactValue) : null;

    const record = await this.moderationRepository.createAnonymousQuestion({
      questionTextEncrypted: encryptedText,
      contactValueEncrypted: encryptedContact,
      publishAllowed: dto.publishAllowed ?? false,
      triggerFlags,
      status,
    });

    return {
      id: record.id,
      status: record.status,
      triggerFlags,
      submittedAt: record.submittedAt,
    };
  }

  private detectTriggers(text: string): UgcTriggerFlag[] {
    const flags = new Set<UgcTriggerFlag>();
    const content = text.toLowerCase();

    const crisisKeywords = [
      'суицид',
      'убить себя',
      'покончить',
      'не хочу жить',
      'умереть',
      'конец',
      'прыгнуть',
      'повеситься',
      'самоубийство',
      'таблетки все',
      'передозировка',
      'резать вены',
      'порезать',
      'бритва',
      'самоповреждение',
      'бьёт меня',
      'ударил',
      'избил',
      'насилие',
      'изнасилование',
      'не могу уйти',
      'боюсь за жизнь',
      'угрожает убить',
      'держит силой',
    ];
    if (crisisKeywords.some((keyword) => content.includes(keyword))) {
      flags.add(UgcTriggerFlag.crisis);
    }

    const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
    const phonePattern = /(\+7\d{10}|8\d{10}|\+?\d[\d\s\-\(\)]{8,}\d)/;
    const piiKeywordPattern = /(паспорт|адрес)/i;
    if (emailPattern.test(content) || phonePattern.test(content) || piiKeywordPattern.test(content)) {
      flags.add(UgcTriggerFlag.pii);
    }

    const medicalKeywords = [
      'диагноз',
      'лекарство',
      'таблетки назначьте',
      'анализы',
      'симптомы болезни',
      'операция',
      'лечение',
      'психиатр',
      'медицин',
      'лекарств',
    ];
    if (medicalKeywords.some((keyword) => content.includes(keyword))) {
      flags.add(UgcTriggerFlag.medical);
    }

    return Array.from(flags);
  }
}

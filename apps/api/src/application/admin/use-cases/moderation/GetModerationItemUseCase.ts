import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUgcModerationRepository } from '@domain/moderation/repositories/IUgcModerationRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { ModerationItemDetailsDto } from '../../dto/moderation.dto';

@Injectable()
export class GetModerationItemUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(id: string): Promise<ModerationItemDetailsDto> {
    const item = await this.moderationRepository.getAnonymousQuestionById(id);
    if (!item) {
      throw new NotFoundException('Moderation item not found');
    }

    return {
      id: item.id,
      status: item.status,
      submittedAt: item.submittedAt,
      answeredAt: item.answeredAt,
      triggerFlags: item.triggerFlags,
      questionText: this.safeDecrypt(item.questionTextEncrypted),
      contactValue: item.contactValueEncrypted ? this.safeDecrypt(item.contactValueEncrypted) : null,
      publishAllowed: item.publishAllowed,
      answers: item.answers.map((answer) => ({
        id: answer.id,
        text: this.safeDecrypt(answer.answerTextEncrypted),
        publishedAt: answer.publishedAt,
        answeredBy: answer.answeredBy,
      })),
      moderations: item.moderations.map((action) => ({
        id: action.id,
        action: action.action,
        reasonCategory: action.reasonCategory,
        createdAt: action.createdAt,
        moderator: action.moderator,
      })),
    };
  }

  private safeDecrypt(ciphertext: string): string {
    try {
      return this.encryptionService.decrypt(ciphertext);
    } catch {
      return '[encrypted]';
    }
  }
}

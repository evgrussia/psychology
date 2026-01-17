import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUgcModerationRepository } from '@domain/moderation/repositories/IUgcModerationRepository';
import { AnonymousQuestionStatusResponseDto } from '../dto/ugc.dto';

@Injectable()
export class GetAnonymousQuestionStatusUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
  ) {}

  async execute(id: string): Promise<AnonymousQuestionStatusResponseDto> {
    const item = await this.moderationRepository.getAnonymousQuestionById(id);
    if (!item) {
      throw new NotFoundException('Question not found');
    }

    return {
      id: item.id,
      status: item.status,
      submittedAt: item.submittedAt,
      answeredAt: item.answeredAt,
      triggerFlags: item.triggerFlags,
    };
  }
}

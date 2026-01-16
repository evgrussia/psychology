import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IDeepLinkRepository } from '@domain/telegram/repositories/IDeepLinkRepository';
import { ResolveDeepLinkResponseDto } from '../dto/deep-links.dto';

@Injectable()
export class ResolveDeepLinkUseCase {
  constructor(
    @Inject('IDeepLinkRepository')
    private readonly deepLinkRepository: IDeepLinkRepository,
  ) {}

  async execute(deepLinkId: string): Promise<ResolveDeepLinkResponseDto> {
    const trimmed = deepLinkId?.trim();
    if (!trimmed) {
      throw new NotFoundException('Deep link not found');
    }

    const deepLink = await this.deepLinkRepository.findActiveById(trimmed, new Date());
    if (!deepLink) {
      throw new NotFoundException('Deep link not found');
    }

    return {
      payload: {
        dl: deepLink.deepLinkId,
        f: deepLink.flow,
        t: deepLink.topicCode ?? undefined,
        e: deepLink.entityRef ?? undefined,
        s: deepLink.sourcePage ?? undefined,
      },
    };
  }
}

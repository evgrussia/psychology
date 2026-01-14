import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContentItemRepository } from '@domain/content/repositories/IContentItemRepository';
import { ContentItemResponseDto } from '../dto/content.dto';

@Injectable()
export class ArchiveContentItemUseCase {
  constructor(
    @Inject('IContentItemRepository')
    private readonly contentItemRepo: IContentItemRepository,
  ) {}

  async execute(id: string): Promise<ContentItemResponseDto> {
    const item = await this.contentItemRepo.findById(id);
    if (!item) {
      throw new NotFoundException(`Content item with ID "${id}" not found`);
    }

    item.archive();
    await this.contentItemRepo.save(item);

    return item.toObject();
  }
}

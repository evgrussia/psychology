import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';
import { ReorderCuratedItemsDto } from '../dto/curated.dto';

@Injectable()
export class ReorderCuratedItemsUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
  ) {}

  async execute(collectionId: string, dto: ReorderCuratedItemsDto): Promise<void> {
    const collection = await this.curatedRepo.findById(collectionId);
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    const items = collection.items;
    
    // Update positions based on the order of IDs in the DTO
    dto.itemIds.forEach((id, index) => {
      const item = items.find(i => i.id === id);
      if (item) {
        item.updatePosition(index);
      }
    });

    // Sort items locally before saving (optional but good practice)
    items.sort((a, b) => a.position - b.position);

    await this.curatedRepo.save(collection);
  }
}

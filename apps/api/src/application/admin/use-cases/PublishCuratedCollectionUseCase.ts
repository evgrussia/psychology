import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICuratedCollectionRepository } from '@domain/content/repositories/ICuratedCollectionRepository';

@Injectable()
export class PublishCuratedCollectionUseCase {
  constructor(
    @Inject('ICuratedCollectionRepository')
    private readonly curatedRepo: ICuratedCollectionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const collection = await this.curatedRepo.findById(id);
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    collection.publish();

    await this.curatedRepo.save(collection);
  }
}

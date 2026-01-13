import { Inject, Injectable } from '@nestjs/common';
import { ITagRepository } from '../../../domain/content/repositories/ITagRepository';

@Injectable()
export class ListTagsUseCase {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepo: ITagRepository,
  ) {}

  async execute() {
    const tags = await this.tagRepo.findAll();
    return tags.map(t => t.toObject());
  }
}

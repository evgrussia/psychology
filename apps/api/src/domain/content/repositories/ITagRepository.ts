import { Tag } from '../entities/Tag';

export interface ITagRepository {
  findBySlug(slug: string): Promise<Tag | null>;
  findById(id: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  save(tag: Tag): Promise<void>;
}

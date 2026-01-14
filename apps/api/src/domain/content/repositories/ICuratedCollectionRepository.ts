import { CuratedCollection } from '../entities/CuratedCollection';

export interface ICuratedCollectionRepository {
  findById(id: string): Promise<CuratedCollection | null>;
  findBySlug(slug: string): Promise<CuratedCollection | null>;
  findAll(): Promise<CuratedCollection[]>;
  findPublished(): Promise<CuratedCollection[]>;
  save(collection: CuratedCollection): Promise<void>;
  delete(id: string): Promise<void>;
}

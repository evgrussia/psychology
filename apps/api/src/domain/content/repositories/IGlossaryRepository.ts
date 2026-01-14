import { GlossaryTerm } from '../entities/GlossaryTerm';
import { ContentStatus, GlossaryTermCategory } from '../value-objects/ContentEnums';

export interface IGlossaryRepository {
  findBySlug(slug: string): Promise<GlossaryTerm | null>;
  findById(id: string): Promise<GlossaryTerm | null>;
  findAll(filters?: { 
    status?: ContentStatus; 
    category?: GlossaryTermCategory;
    search?: string;
  }): Promise<GlossaryTerm[]>;
  save(term: GlossaryTerm): Promise<void>;
  delete(id: string): Promise<void>;
}

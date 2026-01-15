import { Service } from '../entities/Service';
import { ServiceStatus } from '../value-objects/ServiceEnums';

export interface IServiceRepository {
  findBySlug(slug: string): Promise<Service | null>;
  findAll(status?: ServiceStatus): Promise<Service[]>;
  findByTopic(topicCode: string, status?: ServiceStatus): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  save(service: Service): Promise<void>;
}

import { Topic } from '../entities/Topic';

export interface ITopicRepository {
  findByCode(code: string): Promise<Topic | null>;
  findAll(): Promise<Topic[]>;
  findAllActive(): Promise<Topic[]>;
  save(topic: Topic): Promise<void>;
}

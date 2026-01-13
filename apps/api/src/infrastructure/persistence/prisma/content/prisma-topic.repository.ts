import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ITopicRepository } from '../../../../../domain/content/repositories/ITopicRepository';
import { Topic } from '../../../../../domain/content/entities/Topic';
import { TopicMapper } from './topic.mapper';

@Injectable()
export class PrismaTopicRepository implements ITopicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCode(code: string): Promise<Topic | null> {
    const topic = await this.prisma.topic.findUnique({
      where: { code },
    });
    if (!topic) return null;
    return TopicMapper.toDomain(topic);
  }

  async findAll(): Promise<Topic[]> {
    const topics = await this.prisma.topic.findMany();
    return topics.map(TopicMapper.toDomain);
  }

  async findAllActive(): Promise<Topic[]> {
    const topics = await this.prisma.topic.findMany({
      where: { is_active: true },
    });
    return topics.map(TopicMapper.toDomain);
  }

  async save(topic: Topic): Promise<void> {
    const data = TopicMapper.toPrisma(topic);
    await this.prisma.topic.upsert({
      where: { code: topic.code },
      update: data,
      create: data,
    });
  }
}

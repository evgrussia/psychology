import { Topic as PrismaTopic } from '@prisma/client';
import { Topic } from '@domain/content/entities/Topic';

export class TopicMapper {
  static toDomain(prismaTopic: PrismaTopic): Topic {
    return Topic.reconstitute({
      code: prismaTopic.code,
      title: prismaTopic.title,
      isActive: prismaTopic.is_active,
    });
  }

  static toPrisma(domainTopic: Topic): PrismaTopic {
    const obj = domainTopic.toObject();
    return {
      code: obj.code,
      title: obj.title,
      is_active: obj.isActive,
    };
  }
}

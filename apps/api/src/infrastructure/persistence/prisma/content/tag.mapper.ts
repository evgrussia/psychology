import { Tag as PrismaTag } from '@prisma/client';
import { Tag } from '../../../../../domain/content/entities/Tag';

export class TagMapper {
  static toDomain(prismaTag: PrismaTag): Tag {
    return Tag.create({
      id: prismaTag.id,
      slug: prismaTag.slug,
      title: prismaTag.title,
    });
  }

  static toPrisma(domainTag: Tag): PrismaTag {
    const obj = domainTag.toObject();
    return {
      id: obj.id,
      slug: obj.slug,
      title: obj.title,
    };
  }
}

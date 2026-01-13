import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaContentItemRepository } from '../persistence/prisma/content/prisma-content-item.repository';
import { PrismaTopicRepository } from '../persistence/prisma/content/prisma-topic.repository';
import { PrismaTagRepository } from '../persistence/prisma/content/prisma-tag.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IContentItemRepository',
      useClass: PrismaContentItemRepository,
    },
    {
      provide: 'ITopicRepository',
      useClass: PrismaTopicRepository,
    },
    {
      provide: 'ITagRepository',
      useClass: PrismaTagRepository,
    },
  ],
  exports: ['IContentItemRepository', 'ITopicRepository', 'ITagRepository'],
})
export class ContentModule {}

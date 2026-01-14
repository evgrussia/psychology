import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaContentItemRepository } from '../persistence/prisma/content/prisma-content-item.repository';
import { PrismaTopicRepository } from '../persistence/prisma/content/prisma-topic.repository';
import { PrismaTagRepository } from '../persistence/prisma/content/prisma-tag.repository';
import { PrismaGlossaryRepository } from '../persistence/prisma/content/prisma-glossary.repository';
import { PrismaCuratedCollectionRepository } from '../persistence/prisma/content/prisma-curated-collection.repository';

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
    {
      provide: 'IGlossaryRepository',
      useClass: PrismaGlossaryRepository,
    },
    {
      provide: 'ICuratedCollectionRepository',
      useClass: PrismaCuratedCollectionRepository,
    },
  ],
  exports: [
    'IContentItemRepository',
    'ITopicRepository',
    'ITagRepository',
    'IGlossaryRepository',
    'ICuratedCollectionRepository',
  ],
})
export class ContentModule {}

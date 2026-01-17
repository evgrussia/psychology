import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaUgcModerationRepository } from '../persistence/prisma/moderation/prisma-ugc-moderation.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IUgcModerationRepository',
      useClass: PrismaUgcModerationRepository,
    },
  ],
  exports: ['IUgcModerationRepository'],
})
export class ModerationModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaMessageTemplateRepository } from '../persistence/prisma/notifications/prisma-message-template.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IMessageTemplateRepository',
      useClass: PrismaMessageTemplateRepository,
    },
  ],
  exports: ['IMessageTemplateRepository'],
})
export class NotificationsModule {}

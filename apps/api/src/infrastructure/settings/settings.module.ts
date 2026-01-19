import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PrismaSystemSettingsRepository } from '../persistence/prisma/settings/prisma-system-settings.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'ISystemSettingsRepository',
      useClass: PrismaSystemSettingsRepository,
    },
  ],
  exports: ['ISystemSettingsRepository'],
})
export class SettingsModule {}

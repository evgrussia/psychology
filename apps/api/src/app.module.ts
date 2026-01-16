import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './presentation/controllers/health.controller';
import { AdminAuditLogController } from './presentation/controllers/admin-audit-log.controller';
import { ClientController } from './presentation/controllers/client.controller';
import { IdentityModule } from './infrastructure/identity/identity.module';
import { MediaModule } from './infrastructure/media/media.module';
import { EventsModule } from './infrastructure/events/events.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuditModule } from './infrastructure/audit/audit.module';

import { validate } from './infrastructure/config/env.validation';

import { AdminModule } from './infrastructure/admin/admin.module';
import { PublicModule } from './infrastructure/public/public.module';
import { InteractiveModule } from './infrastructure/interactive/interactive.module';
import { CommonModule } from './infrastructure/common/common.module';
import { WebhooksModule } from './infrastructure/webhooks/webhooks.module';
import { TelegramModule } from './infrastructure/telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    CommonModule,
    DatabaseModule,
    EventsModule,
    IdentityModule,
    MediaModule,
    AuditModule,
    AdminModule,
    PublicModule,
    InteractiveModule,
    WebhooksModule,
    TelegramModule,
  ],
  controllers: [HealthController, AdminAuditLogController, ClientController],
  providers: [],
})
export class AppModule {}

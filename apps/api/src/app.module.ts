import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './presentation/controllers/health.controller';
import { AdminController } from './presentation/controllers/admin.controller';
import { ClientController } from './presentation/controllers/client.controller';
import { EventBusService } from './infrastructure/events/event-bus.service';
import { HttpClientConfig } from './infrastructure/config/http-client.config';
import { PrismaService } from './infrastructure/database/prisma.service';
import { IdentityModule } from './infrastructure/identity/identity.module';

import { validate } from './infrastructure/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    IdentityModule,
  ],
  controllers: [HealthController, AdminController, ClientController],
  providers: [
    EventBusService,
    {
      provide: 'IEventBus',
      useExisting: EventBusService,
    },
    HttpClientConfig,
    PrismaService,
  ],
  exports: [EventBusService, 'IEventBus', HttpClientConfig, PrismaService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './presentation/controllers/health.controller';
import { EventBusService } from './infrastructure/events/event-bus.service';
import { HttpClientConfig } from './infrastructure/config/http-client.config';
import { PrismaService } from './infrastructure/database/prisma.service';

import { validate } from './infrastructure/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
  controllers: [HealthController],
  providers: [
    EventBusService,
    HttpClientConfig,
    PrismaService,
  ],
  exports: [EventBusService, HttpClientConfig, PrismaService],
})
export class AppModule {}

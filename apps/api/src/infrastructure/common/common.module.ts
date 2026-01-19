import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from '../integrations/email.service';
import { YooKassaService } from '../integrations/yookassa.service';
import { PrismaPaymentRepository } from '../persistence/prisma/payment/prisma-payment.repository';
import { AesGcmEncryptionService } from '../security/encryption.service';
import { HttpClientConfig } from '../config/http-client.config';
import { AnalyticsCacheService } from './analytics-cache.service';
import { AlertService } from '../observability/alert.service';
import { SentryErrorReporter } from '../observability/sentry-error-reporter.service';
import { ErrorRateMonitor } from '../observability/error-rate-monitor.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'IEmailService',
      useClass: EmailService,
    },
    {
      provide: 'IAlertService',
      useClass: AlertService,
    },
    {
      provide: 'IErrorReporter',
      useClass: SentryErrorReporter,
    },
    {
      provide: 'IPaymentService',
      useClass: YooKassaService,
    },
    {
      provide: 'IPaymentRepository',
      useClass: PrismaPaymentRepository,
    },
    {
      provide: 'IEncryptionService',
      useClass: AesGcmEncryptionService,
    },
    HttpClientConfig,
    AnalyticsCacheService,
    ErrorRateMonitor,
  ],
  exports: [
    'IEmailService',
    'IAlertService',
    'IErrorReporter',
    'IPaymentService',
    'IPaymentRepository',
    'IEncryptionService',
    HttpClientConfig,
    AnalyticsCacheService,
    ErrorRateMonitor,
  ],
})
export class CommonModule {}

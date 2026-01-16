import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from '../integrations/email.service';
import { YooKassaService } from '../integrations/yookassa.service';
import { PrismaPaymentRepository } from '../persistence/prisma/payment/prisma-payment.repository';
import { AesGcmEncryptionService } from '../security/encryption.service';
import { HttpClientConfig } from '../config/http-client.config';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: 'IEmailService',
      useClass: EmailService,
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
  ],
  exports: [
    'IEmailService',
    'IPaymentService',
    'IPaymentRepository',
    'IEncryptionService',
    HttpClientConfig,
  ],
})
export class CommonModule {}

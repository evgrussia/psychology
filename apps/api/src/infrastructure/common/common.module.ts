import { Module, Global } from '@nestjs/common';
import { EmailStub } from '../integrations/email.stub';
import { YooKassaStub } from '../integrations/payment.stub';
import { AesGcmEncryptionService } from '../security/encryption.service';
import { HttpClientConfig } from '../config/http-client.config';

@Global()
@Module({
  providers: [
    {
      provide: 'IEmailService',
      useClass: EmailStub,
    },
    {
      provide: 'IPaymentService',
      useClass: YooKassaStub,
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
    'IEncryptionService',
    HttpClientConfig,
  ],
})
export class CommonModule {}

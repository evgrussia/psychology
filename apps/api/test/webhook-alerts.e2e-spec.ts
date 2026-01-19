import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { YooKassaWebhookVerifier } from '../src/infrastructure/webhooks/yookassa-webhook-verifier';

describe('Webhook alerts (e2e)', () => {
  let app: INestApplication;
  const alertService = {
    notify: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('IAlertService')
      .useValue(alertService)
      .overrideProvider(YooKassaWebhookVerifier)
      .useValue({
        verify: () => ({ ok: false, reason: 'signature_missing' }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    alertService.notify.mockClear();
  });

  it('should alert when webhook verification fails', async () => {
    await request(app.getHttpServer())
      .post('/api/webhooks/yookassa')
      .send({
        event: 'payment.succeeded',
        id: 'evt-failed',
        object: {
          id: 'pay-failed',
          status: 'succeeded',
        },
      })
      .expect(401);

    expect(alertService.notify).toHaveBeenCalled();
    const payload = alertService.notify.mock.calls[0][0];
    expect(payload.key).toBe('yookassa_webhook_verification_failed');
  });
});

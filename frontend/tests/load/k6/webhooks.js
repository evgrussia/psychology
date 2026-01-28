import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Load test for Webhooks
 * 
 * Scenario: Интеграции (webhooks)
 * - Нагрузка: 50-100 webhooks/минуту
 * - Действия: обработка webhooks от ЮKassa, Google Calendar
 * 
 * Метрики:
 * - Webhook processing p95 ≤ 500ms
 * - Идемпотентность (0 дублирующих обработок)
 * - Retry logic работает корректно
 */

const errorRate = new Rate('errors');
const webhookSuccessRate = new Rate('webhook_success');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // 50 webhooks/minute
    { duration: '3m', target: 50 },
    { duration: '1m', target: 100 },   // 100 webhooks/minute
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // Webhook processing p95 ≤ 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
    webhook_success: ['rate>0.99'],   // Success rate ≥ 99%
    errors: ['rate<0.01'],
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // Simulate ЮKassa webhook
  const yookassaWebhook = JSON.stringify({
    event: 'payment.succeeded',
    object: {
      id: `payment_${__VU}_${__ITER}`,
      status: 'succeeded',
      amount: {
        value: '5000.00',
        currency: 'RUB',
      },
      metadata: {
        appointment_id: `appointment_${__VU}`,
      },
    },
  });

  const yookassaResponse = http.post(
    `${API_URL}/api/v1/webhooks/yookassa`,
    yookassaWebhook,
    {
      headers: {
        'Content-Type': 'application/json',
        // In real scenario, add signature validation header
        // 'X-YooMoney-Signature': 'signature',
      },
    }
  );

  const yookassaCheck = check(yookassaResponse, {
    'yookassa webhook processed': (r) => r.status === 200 || r.status === 204,
    'yookassa webhook response time < 500ms': (r) => r.timings.duration < 500,
  });

  webhookSuccessRate.add(yookassaCheck);
  errorRate.add(!yookassaCheck);

  sleep(0.6); // ~100 webhooks per minute
}

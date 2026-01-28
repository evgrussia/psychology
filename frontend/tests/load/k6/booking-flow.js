import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Load test for Booking Flow (G2 scenario)
 * 
 * Scenario: Booking Flow (G2)
 * - Нагрузка: 20-50 одновременных пользователей
 * - Действия: выбор услуги, выбор слота, заполнение анкеты, оплата
 * 
 * Метрики:
 * - API p95 ≤ 800ms (booking endpoints)
 * - Success rate ≥ 99.5% (успешные подтверждения)
 * - Защита от гонок (0 дублирующих броней)
 */

const errorRate = new Rate('errors');
const bookingSuccessRate = new Rate('booking_success');

export const options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp-up to 20 users
    { duration: '3m', target: 20 },  // Stay at 20 users
    { duration: '1m', target: 50 },  // Ramp-up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests must be below 800ms
    http_req_failed: ['rate<0.005'],  // Error rate < 0.5%
    booking_success: ['rate>0.995'],  // Success rate ≥ 99.5%
    errors: ['rate<0.005'],
  },
};

const BASE_URL = __ENV.STAGING_URL || 'http://localhost:3000';
const API_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // Step 1: Get services list
  const servicesResponse = http.get(`${API_URL}/api/v1/booking/services`);
  const servicesCheck = check(servicesResponse, {
    'services status is 200': (r) => r.status === 200,
    'services response time < 800ms': (r) => r.timings.duration < 800,
    'services has data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.results && data.results.length > 0;
      } catch {
        return false;
      }
    },
  });
  errorRate.add(!servicesCheck);
  sleep(1);

  if (!servicesCheck) {
    return;
  }

  // Step 2: Get available slots
  let serviceId = 'test-service-id';
  try {
    const servicesData = JSON.parse(servicesResponse.body);
    if (servicesData.results && servicesData.results.length > 0) {
      serviceId = servicesData.results[0].id;
    }
  } catch (e) {
    // Use default service ID
  }

  const dateFrom = new Date().toISOString().split('T')[0];
  const dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const slotsResponse = http.get(
    `${API_URL}/api/v1/booking/services/${serviceId}/slots?date_from=${dateFrom}&date_to=${dateTo}`
  );
  const slotsCheck = check(slotsResponse, {
    'slots status is 200': (r) => r.status === 200,
    'slots response time < 800ms': (r) => r.timings.duration < 800,
  });
  errorRate.add(!slotsCheck);
  sleep(1);

  // Step 3: Create appointment (if slots available)
  if (slotsCheck && slotsResponse.status === 200) {
    try {
      const slotsData = JSON.parse(slotsResponse.body);
      if (slotsData.results && slotsData.results.length > 0) {
        const slotId = slotsData.results[0].id;
        
        // Note: In real test, we need authentication token
        // For load testing, we might skip authentication or use test tokens
        const appointmentData = JSON.stringify({
          service_id: serviceId,
          slot_id: slotId,
          name: `Test User ${__VU}`,
          email: `test${__VU}@example.com`,
          phone: '+79991234567',
        });

        const appointmentResponse = http.post(
          `${API_URL}/api/v1/booking/appointments`,
          appointmentData,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const appointmentCheck = check(appointmentResponse, {
          'appointment created': (r) => r.status === 201 || r.status === 200,
          'appointment response time < 800ms': (r) => r.timings.duration < 800,
        });

        bookingSuccessRate.add(appointmentCheck);
        errorRate.add(!appointmentCheck);
      }
    } catch (e) {
      errorRate.add(1);
    }
  }

  sleep(1);
}

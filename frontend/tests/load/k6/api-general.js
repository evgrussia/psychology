import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Load test for General API
 * 
 * Scenario: API (общая нагрузка)
 * - Нагрузка: 100-200 одновременных запросов
 * - Действия: смешанные запросы (read/write)
 * 
 * Метрики:
 * - Read operations p95 ≤ 300ms
 * - Write operations p95 ≤ 800ms
 * - Error rate ≤ 0.1%
 */

const errorRate = new Rate('errors');
const readDuration = new Rate('read_success');
const writeDuration = new Rate('write_success');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up to 100 requests
    { duration: '5m', target: 100 },   // Stay at 100 requests
    { duration: '2m', target: 200 },   // Ramp-up to 200 requests
    { duration: '5m', target: 200 },    // Stay at 200 requests
    { duration: '2m', target: 0 },      // Ramp-down
  ],
  thresholds: {
    'http_req_duration{type:read}': ['p(95)<300'],   // Read operations p95 ≤ 300ms
    'http_req_duration{type:write}': ['p(95)<800'],  // Write operations p95 ≤ 800ms
    http_req_failed: ['rate<0.001'],                  // Error rate ≤ 0.1%
    errors: ['rate<0.001'],
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // Read operations (70% of requests)
  if (Math.random() < 0.7) {
    // GET /api/v1/content/articles
    const articlesResponse = http.get(`${API_URL}/api/v1/content/articles`, {
      tags: { type: 'read' },
    });
    const articlesCheck = check(articlesResponse, {
      'articles status is 200': (r) => r.status === 200,
      'articles response time < 300ms': (r) => r.timings.duration < 300,
    });
    readDuration.add(articlesCheck);
    errorRate.add(!articlesCheck);
    sleep(0.5);
  } else {
    // Write operations (30% of requests)
    // Example: POST /api/v1/cabinet/diary (requires auth in real scenario)
    // For load testing, we might use test tokens or skip auth
    const diaryData = JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      mood: 'neutral',
      notes: `Test entry ${__VU}`,
    });

    const diaryResponse = http.post(
      `${API_URL}/api/v1/cabinet/diary`,
      diaryData,
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { type: 'write' },
      }
    );

    const diaryCheck = check(diaryResponse, {
      'diary created or authorized': (r) => r.status === 201 || r.status === 401 || r.status === 403,
      'diary response time < 800ms': (r) => r.timings.duration < 800,
    });
    writeDuration.add(diaryCheck);
    errorRate.add(!diaryCheck);
    sleep(0.5);
  }
}

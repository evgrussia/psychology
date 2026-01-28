import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Load test for Public Web (G1 scenario)
 * 
 * Scenario: Публичный Web (G1)
 * - Нагрузка: 50-100 одновременных пользователей
 * - Действия: просмотр главной, лендингов, запуск интерактивов
 * 
 * Метрики:
 * - LCP p75 ≤ 2.5s
 * - INP p75 ≤ 200ms
 * - TTFB p95 ≤ 800ms
 * - Error rate ≤ 0.1%
 */

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp-up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests must be below 800ms
    http_req_failed: ['rate<0.001'],  // Error rate < 0.1%
    errors: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.STAGING_URL || 'http://localhost:3000';

export default function () {
  // Scenario 1: Главная страница
  const homeResponse = http.get(`${BASE_URL}/`);
  const homeCheck = check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 800ms': (r) => r.timings.duration < 800,
    'homepage has content': (r) => r.body.length > 0,
  });
  errorRate.add(!homeCheck);
  sleep(1);

  // Scenario 2: Лендинг темы (например, тревога)
  const topicResponse = http.get(`${BASE_URL}/topics/anxiety`);
  const topicCheck = check(topicResponse, {
    'topic page status is 200': (r) => r.status === 200,
    'topic page response time < 800ms': (r) => r.timings.duration < 800,
  });
  errorRate.add(!topicCheck);
  sleep(1);

  // Scenario 3: Статья
  const articleResponse = http.get(`${BASE_URL}/blog/test-article`);
  const articleCheck = check(articleResponse, {
    'article page status is 200': (r) => r.status === 200,
    'article page response time < 800ms': (r) => r.timings.duration < 800,
  });
  errorRate.add(!articleCheck);
  sleep(1);

  // Scenario 4: Интерактив (квиз)
  const quizResponse = http.get(`${BASE_URL}/quiz/test-quiz`);
  const quizCheck = check(quizResponse, {
    'quiz page status is 200': (r) => r.status === 200,
    'quiz page response time < 800ms': (r) => r.timings.duration < 800,
  });
  errorRate.add(!quizCheck);
  sleep(1);
}

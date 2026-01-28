# Load Testing with k6

Нагрузочное тестирование для Phase 7 согласно спецификации.

## Установка k6

### Windows
```powershell
choco install k6
```

### macOS
```bash
brew install k6
```

### Linux
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Запуск тестов

### Публичный Web (G1)
```bash
k6 run tests/load/k6/public-web.js --env STAGING_URL=http://localhost:3000
```

### Booking Flow (G2)
```bash
k6 run tests/load/k6/booking-flow.js --env STAGING_URL=http://localhost:3000 --env API_URL=http://localhost:8000
```

### Общая нагрузка API
```bash
k6 run tests/load/k6/api-general.js --env API_URL=http://localhost:8000
```

### Webhooks
```bash
k6 run tests/load/k6/webhooks.js --env API_URL=http://localhost:8000
```

## Переменные окружения

- `STAGING_URL` - URL фронтенда (по умолчанию: http://localhost:3000)
- `API_URL` - URL бэкенда API (по умолчанию: http://localhost:8000)

## Метрики

Все тесты выводят следующие метрики:
- `http_req_duration` - время ответа запросов
- `http_req_failed` - процент неудачных запросов
- `errors` - общий процент ошибок

## Результаты

Результаты тестов выводятся в консоль. Для сохранения результатов:

```bash
k6 run tests/load/k6/public-web.js --out json=results.json
```

## Критерии успеха

Согласно спецификации Phase 7:

- **Публичный Web:** LCP p75 ≤ 2.5s, INP p75 ≤ 200ms, TTFB p95 ≤ 800ms, Error rate ≤ 0.1%
- **Booking Flow:** API p95 ≤ 800ms, Success rate ≥ 99.5%
- **API:** Read p95 ≤ 300ms, Write p95 ≤ 800ms, Error rate ≤ 0.1%
- **Webhooks:** Processing p95 ≤ 500ms, Success rate ≥ 99%

---
*Документ создан: Coder Agent*

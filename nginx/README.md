# Nginx Configuration

Эта директория содержит конфигурацию Nginx для production деплоя.

## Структура

```
nginx/
├── nginx.conf          # Основная конфигурация Nginx
├── conf.d/
│   └── default.conf   # Конфигурация виртуальных хостов
├── ssl/               # Символические ссылки на SSL сертификаты
│   ├── fullchain.pem  -> /etc/letsencrypt/live/balance-space.ru/fullchain.pem
│   └── privkey.pem    -> /etc/letsencrypt/live/balance-space.ru/privkey.pem
└── logs/              # Логи Nginx (создается автоматически)
    ├── access.log
    ├── error.log
    ├── web-access.log
    ├── web-error.log
    ├── admin-access.log
    ├── admin-error.log
    ├── api-access.log
    └── api-error.log
```

## Настройка SSL

После получения SSL сертификатов через Certbot, создайте символические ссылки:

```bash
sudo mkdir -p /var/www/psychology/nginx/ssl
sudo ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/fullchain.pem
sudo ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/privkey.pem
```

## Домены

Конфигурация настроена для следующих доменов:

- **balance-space.ru** - основной сайт (Web)
- **www.balance-space.ru** - редирект на balance-space.ru
- **admin.balance-space.ru** - admin панель
- **api.balance-space.ru** - API (опционально)

## Upstream серверы

- `api_backend` → `api:3000` (Backend NestJS)
- `web_backend` → `web:3000` (Frontend Next.js)
- `admin_backend` → `admin:3001` (Admin Next.js)

## Rate Limiting

Настроены два лимита:
- `api_limit` - 10 запросов/сек для API
- `general_limit` - 50 запросов/сек для общих запросов

## Проверка конфигурации

```bash
# Проверить синтаксис конфигурации
docker exec psychology-prod-nginx nginx -t

# Перезагрузить конфигурацию
docker exec psychology-prod-nginx nginx -s reload
```

## Просмотр логов

```bash
# Access логи
docker exec psychology-prod-nginx tail -f /var/log/nginx/access.log

# Error логи
docker exec psychology-prod-nginx tail -f /var/log/nginx/error.log

# Логи конкретного сервиса
docker exec psychology-prod-nginx tail -f /var/log/nginx/web-access.log
docker exec psychology-prod-nginx tail -f /var/log/nginx/admin-access.log
docker exec psychology-prod-nginx tail -f /var/log/nginx/api-access.log
```

## Особенности конфигурации

### Безопасность
- Отключен вывод версии Nginx (`server_tokens off`)
- Добавлены заголовки безопасности (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Настроен SSL с современными протоколами (TLS 1.2, 1.3)

### Производительность
- Включено gzip сжатие для текстовых файлов
- Настроен keepalive для upstream соединений
- Кеширование статических файлов Next.js (/_next/static)

### Проксирование
- Правильная передача заголовков (X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)
- Поддержка WebSocket соединений
- Увеличенные таймауты для долгих запросов

## Обновление сертификатов

Certbot автоматически обновляет сертификаты. После обновления перезапустите Nginx:

```bash
docker restart psychology-prod-nginx
```

## Troubleshooting

### 502 Bad Gateway
1. Проверьте, что backend контейнеры запущены: `docker ps`
2. Проверьте логи backend: `docker logs psychology-prod-api`
3. Проверьте upstream подключения в nginx логах

### SSL ошибки
1. Проверьте наличие сертификатов: `ls -la /etc/letsencrypt/live/balance-space.ru/`
2. Проверьте символические ссылки: `ls -la /var/www/psychology/nginx/ssl/`
3. Проверьте права доступа к сертификатам

### Высокая нагрузка
1. Увеличьте лимиты rate limiting в `nginx.conf`
2. Добавьте больше worker connections
3. Настройте кеширование для API ответов

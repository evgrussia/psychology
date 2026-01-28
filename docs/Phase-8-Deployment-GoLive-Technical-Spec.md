# Phase 8: Deployment & Go Live — Техническая спецификация

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** В работе  
**Основано на:** `docs/Development-Phase-Plan.md`, `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`, `docs/security/security-requirements.md`, `docs/Архитектурный-обзор.md`, `docs/Диаграммы-C4-Sequence-Deployment.md`

---

## 1) Назначение документа

Этот документ содержит **максимально подробные технические спецификации** для Phase 8: Deployment & Go Live, включая:

- Детальную настройку production окружения
- Процедуры миграции БД в production
- Конфигурацию мониторинга и алертов (SLO/SLI)
- Документацию для пользователей и поддержки
- Smoke tests и процедуры Go Live

**Целевая аудитория:** DevOps, SRE, разработчики, ответственные за деплой.

---

## 2) Обзор Phase 8

### 2.1 Цель фазы

Подготовить систему к запуску в production, обеспечив:
- Стабильную работу всех компонентов
- Мониторинг и алертинг согласно SLO
- Безопасность и соответствие требованиям
- Документацию для пользователей и поддержки
- Процедуры восстановления и инцидент-менеджмента

### 2.2 Задачи Phase 8

1. ✅ Настройка production окружения
2. ✅ Миграции БД в production
3. ✅ Настройка мониторинга и алертов
4. ✅ Документация для пользователей
5. ✅ Документация для поддержки
6. ✅ Smoke tests после деплоя
7. ✅ Go Live

### 2.3 Критерии готовности (Definition of Done)

- [ ] Production окружение настроено и протестировано
- [ ] Все миграции БД применены в production
- [ ] Мониторинг и алерты работают согласно SLO
- [ ] Документация для пользователей готова
- [ ] Документация для поддержки готова
- [ ] Smoke tests проходят успешно
- [ ] Go Live процедуры выполнены
- [ ] Post-deployment проверки пройдены

**Оценка:** M (1 неделя)

---

## 3) Настройка Production окружения

### 3.1 Инфраструктура (целевая схема)

Согласно `docs/Диаграммы-C4-Sequence-Deployment.md`:

```
┌─────────────────────────────────────────────────────────┐
│ Production Environment                                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐                                       │
│  │ LB / Nginx   │──────┐                                │
│  │  (HTTPS)     │      │  ┌────────▼────────┐           │
│  └──────────────┘      └─►│  Backend API   │           │
│                           │   (Django)     │           │
│                           └────────┬────────┘           │
│                               │                           │
│         ┌─────────────────────┼─────────────────────┐    │
│         │                     │                     │    │
│  ┌──────▼──────┐    ┌─────────▼─────────┐   ┌──────▼──┐ │
│  │ PostgreSQL  │    │  Redis/Queue     │   │  Media  │ │
│  │  (Primary)   │    │  (Cache/Jobs)    │   │ Storage │ │
│  └─────────────┘    └──────────────────┘   └─────────┘ │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Monitoring & Logging                              │  │
│  │  - Metrics (Prometheus/Grafana)                   │  │
│  │  - Logs (ELK/Loki)                                │  │
│  │  - Tracing (Jaeger/OTEL)                          │  │
│  │  - Alerts (Alertmanager/PagerDuty)                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Требования к серверам

#### 3.2.1 Backend API (Django)

**Минимальные требования:**
- **CPU:** 2+ cores (рекомендуется 4)
- **RAM:** 4GB (рекомендуется 8GB)
- **Disk:** 50GB SSD (для логов и медиа)
- **Network:** 100 Mbps

**Рекомендуемая конфигурация:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Disk:** 100GB SSD
- **OS:** Ubuntu 22.04 LTS / Debian 12

**Масштабирование:**
- Горизонтальное масштабирование (stateless)
- Load balancer (Nginx/HAProxy)
- Минимум 2 инстанса для высокой доступности

#### 3.2.2 PostgreSQL

**Минимальные требования:**
- **CPU:** 2+ cores
- **RAM:** 4GB (рекомендуется 8GB)
- **Disk:** 100GB SSD (рекомендуется 200GB)
- **Network:** 100 Mbps

**Рекомендуемая конфигурация:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Disk:** 200GB SSD с автоматическими бэкапами
- **PostgreSQL:** версия 14+

**Настройки PostgreSQL:**
```sql
-- postgresql.conf (production)
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 100
```

#### 3.2.3 Redis (Cache/Queue)

**Минимальные требования:**
- **CPU:** 1 core
- **RAM:** 2GB
- **Disk:** 10GB

**Рекомендуемая конфигурация:**
- **CPU:** 2 cores
- **RAM:** 4GB
- **Redis:** версия 7+

**Настройки Redis:**
```conf
# redis.conf (production)
maxmemory 3gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3.3 Сетевая конфигурация

#### 3.3.1 Security Groups / Firewall

**Входящие правила:**
- **80/tcp** (HTTP) → Redirect to HTTPS
- **443/tcp** (HTTPS) → Backend API
- **22/tcp** (SSH) → Только из whitelist IP (для админов)

**Исходящие правила:**
- **443/tcp** → Google Calendar API, ЮKassa API, Telegram Bot API
- **25/tcp, 587/tcp** → SMTP (Email)
- **53/udp** → DNS

**Внутренние правила:**
- Backend API → PostgreSQL: **5432/tcp** (только из private subnet)
- Backend API → Redis: **6379/tcp** (только из private subnet)

#### 3.3.2 VPC / Network Isolation

- **Public subnet:** Web App, Load Balancer
- **Private subnet:** Backend API, PostgreSQL, Redis
- **Database subnet:** Только PostgreSQL (без доступа из интернета)

### 3.4 SSL/TLS сертификаты

#### 3.4.1 Требования

Согласно `docs/security/security-requirements.md`:
- **TLS:** TLS 1.3 required (минимум TLS 1.2)
- **Certificate:** Let's Encrypt / ACM (автообновление)
- **HSTS:** `max-age=31536000; includeSubDomains; preload`

#### 3.4.2 Настройка Let's Encrypt

```bash
# Установка certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d example.com -d www.example.com

# Автообновление (cron)
sudo certbot renew --dry-run
```

#### 3.4.3 Nginx конфигурация (HTTPS)

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

### 3.5 Django Production Settings

#### 3.5.1 Структура settings

```python
# config/settings/production.py
from .base import *

# Security
DEBUG = False
ALLOWED_HOSTS = ['example.com', 'www.example.com', 'api.example.com']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
        'CONN_MAX_AGE': 600,
    }
}

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f"redis://{os.environ.get('REDIS_HOST', 'localhost')}:6379/1",
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
        }
    }
}

# Static & Media
STATIC_ROOT = '/var/www/static/'
MEDIA_ROOT = '/var/www/media/'
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/app.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 10,
            'formatter': 'json',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'app': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@example.com')

# Celery (если используется)
CELERY_BROKER_URL = f"redis://{os.environ.get('REDIS_HOST', 'localhost')}:6379/0"
CELERY_RESULT_BACKEND = f"redis://{os.environ.get('REDIS_HOST', 'localhost')}:6379/0"
```

#### 3.5.2 Environment Variables

**Секреты (через secrets manager):**
```bash
# .env.production (НЕ коммитить в git!)
DB_NAME=psychology_prod
DB_USER=psychology_user
DB_PASSWORD=<secure_password>
DB_HOST=postgres.internal
DB_PORT=5432

REDIS_HOST=redis.internal
REDIS_PORT=6379

SECRET_KEY=<django_secret_key>
ALLOWED_HOSTS=example.com,www.example.com

# External services
YOOKASSA_SHOP_ID=<shop_id>
YOOKASSA_SECRET_KEY=<secret_key>
GOOGLE_CALENDAR_CLIENT_ID=<client_id>
GOOGLE_CALENDAR_CLIENT_SECRET=<client_secret>
TELEGRAM_BOT_TOKEN=<bot_token>
TELEGRAM_CHANNEL_ID=<channel_id>

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@example.com
EMAIL_HOST_PASSWORD=<email_password>
DEFAULT_FROM_EMAIL=noreply@example.com

# Analytics (без PII)
ANALYTICS_API_KEY=<analytics_key>
ANALYTICS_ENDPOINT=https://analytics.example.com/events
```

### 3.6 Secrets Management

#### 3.6.1 Требования

Согласно `docs/security/security-requirements.md`:
- **Use:** Environment variables + secrets manager (AWS Secrets Manager / Vault / аналоги)
- **Rotation:** Каждые 90 дней (или при компрометации)
- **Never in:** Коде, логах, git репозитории

#### 3.6.2 Реализация

**Вариант 1: AWS Secrets Manager**
```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='eu-central-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Использование
secrets = get_secret('psychology/production')
DB_PASSWORD = secrets['db_password']
```

**Вариант 2: HashiCorp Vault**
```python
import hvac

client = hvac.Client(url='https://vault.example.com:8200')
client.token = os.environ.get('VAULT_TOKEN')

secrets = client.secrets.kv.v2.read_secret_version(path='psychology/production')
DB_PASSWORD = secrets['data']['data']['db_password']
```

**Вариант 3: Environment Variables (для простых случаев)**
```bash
# Использовать .env файлы (НЕ коммитить!)
# Загружать через python-dotenv или аналоги
```

### 3.7 Process Management (Gunicorn/uWSGI)

#### 3.7.1 Gunicorn конфигурация

```python
# gunicorn_config.py
import multiprocessing

bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 50
preload_app = True
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
```

#### 3.7.2 Systemd Service

```ini
# /etc/systemd/system/psychology-api.service
[Unit]
Description=Psychology API (Django)
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/psychology/backend
Environment="PATH=/var/www/psychology/venv/bin"
EnvironmentFile=/var/www/psychology/.env.production
ExecStart=/var/www/psychology/venv/bin/gunicorn \
    --config /var/www/psychology/backend/gunicorn_config.py \
    config.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Активация:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable psychology-api
sudo systemctl start psychology-api
sudo systemctl status psychology-api
```

### 3.8 Database Backup Configuration

#### 3.8.1 Требования

Согласно `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`:
- **RPO:** ≤ 24 часа (ежедневный бэкап)
- **RTO:** ≤ 4 часа
- **Backup encryption:** Все бэкапы шифруются
- **Testing:** Тест восстановления не реже 1 раза в месяц

#### 3.8.2 Автоматические бэкапы

```bash
#!/bin/bash
# /usr/local/bin/backup_postgres.sh

BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="psychology_prod"
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}.sql.gz"
ENCRYPTED_FILE="${BACKUP_DIR}/backup_${DATE}.sql.gz.enc"
RETENTION_DAYS=30

# Создание бэкапа
pg_dump -h localhost -U psychology_user -d $DB_NAME | \
    gzip > $BACKUP_FILE

# Шифрование
openssl enc -aes-256-cbc -salt -in $BACKUP_FILE -out $ENCRYPTED_FILE \
    -pass file:/etc/backup_key.txt

# Удаление незашифрованного файла
rm $BACKUP_FILE

# Загрузка в S3 (опционально)
aws s3 cp $ENCRYPTED_FILE s3://psychology-backups/postgres/

# Очистка старых бэкапов
find $BACKUP_DIR -name "backup_*.sql.gz.enc" -mtime +$RETENTION_DAYS -delete

# Логирование
echo "$(date): Backup completed: $ENCRYPTED_FILE" >> /var/log/backup.log
```

**Cron задача:**
```bash
# /etc/cron.daily/postgres-backup
0 2 * * * /usr/local/bin/backup_postgres.sh
```

#### 3.8.3 Восстановление из бэкапа

```bash
#!/bin/bash
# /usr/local/bin/restore_postgres.sh

BACKUP_FILE=$1
DECRYPTED_FILE="${BACKUP_FILE%.enc}"

# Расшифровка
openssl enc -aes-256-cbc -d -in $BACKUP_FILE -out $DECRYPTED_FILE \
    -pass file:/etc/backup_key.txt

# Восстановление
gunzip < $DECRYPTED_FILE | psql -h localhost -U psychology_user -d psychology_prod

# Очистка
rm $DECRYPTED_FILE
```

---

## 4) Миграции БД в Production

### 4.1 Pre-deployment Checklist

- [ ] Все миграции протестированы в staging
- [ ] Бэкап production БД создан
- [ ] План отката (rollback) подготовлен
- [ ] Окно обслуживания согласовано
- [ ] Команда на связи

### 4.2 Процедура миграции

#### 4.2.1 Шаг 1: Создание бэкапа

```bash
# Полный бэкап перед миграцией
pg_dump -h postgres.internal -U psychology_user -d psychology_prod \
    -F c -f /var/backups/pre_migration_$(date +%Y%m%d_%H%M%S).dump

# Проверка целостности
pg_restore --list /var/backups/pre_migration_*.dump | head -20
```

#### 4.2.2 Шаг 2: Проверка миграций

```bash
# Просмотр неприменённых миграций
cd /var/www/psychology/backend
source venv/bin/activate
python manage.py showmigrations --plan

# Dry-run (без применения)
python manage.py migrate --plan
```

#### 4.2.3 Шаг 3: Применение миграций

```bash
# Применение всех миграций
python manage.py migrate --no-input

# Проверка статуса
python manage.py showmigrations
```

#### 4.2.4 Шаг 4: Проверка целостности

```sql
-- Проверка схемы
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Проверка индексов
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Проверка ограничений
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace;
```

### 4.3 Rollback процедура

#### 4.3.1 Откат миграций

```bash
# Откат последней миграции
python manage.py migrate app_name migration_name

# Откат всех миграций приложения
python manage.py migrate app_name zero

# Восстановление из бэкапа (крайний случай)
pg_restore -h postgres.internal -U psychology_user -d psychology_prod \
    -c /var/backups/pre_migration_*.dump
```

### 4.4 Data Migration (если требуется)

#### 4.4.1 Создание data migration

```python
# migrations/0002_migrate_data.py
from django.db import migrations

def migrate_old_data(apps, schema_editor):
    OldModel = apps.get_model('app', 'OldModel')
    NewModel = apps.get_model('app', 'NewModel')
    
    for old_item in OldModel.objects.all():
        NewModel.objects.create(
            field1=old_item.field1,
            field2=old_item.field2,
        )

def reverse_migration(apps, schema_editor):
    # Логика отката
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('app', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(migrate_old_data, reverse_migration),
    ]
```

---

## 5) Настройка мониторинга и алертов

### 5.1 Требования SLO/SLI

Согласно `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`:

| Контур | SLI | SLO (месяц) |
|--------|-----|-------------|
| Публичный Web | A_web | **99.9%** |
| Backend API | A_api | **99.9%** |
| Booking | S_booking | **99.5%** |
| Payments | S_payments | **99.9%** |
| Telegram bot | A_tg_bot | **99.5%** |
| Admin panel | A_admin | **99.5%** |

**Производительность:**
- Web LCP p75 ≤ 2.5s
- Web INP p75 ≤ 200ms
- API p95 ≤ 300ms (read), ≤ 800ms (booking)

### 5.2 Метрики (Prometheus)

#### 5.2.1 Установка Prometheus

```bash
# Скачивание
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus

# Создание пользователя
sudo useradd --no-create-home --shell /bin/false prometheus
sudo chown -R prometheus:prometheus /opt/prometheus
```

#### 5.2.2 Конфигурация Prometheus

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    environment: 'prod'

rule_files:
  - '/etc/prometheus/alerts/*.yml'

scrape_configs:
  # Django metrics (через django-prometheus)
  - job_name: 'django'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # PostgreSQL exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  # Redis exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  # Node exporter (системные метрики)
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

#### 5.2.3 Django Prometheus Integration

```python
# requirements.txt
django-prometheus==2.3.1

# settings.py
INSTALLED_APPS = [
    'django_prometheus',
    # ...
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    # ...
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

# urls.py
urlpatterns = [
    path('metrics', include('django_prometheus.urls')),
    # ...
]
```

### 5.3 Алерты (Alertmanager)

#### 5.3.1 Правила алертов

```yaml
# /etc/prometheus/alerts/api.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # Доступность API
      - alert: APIHighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Высокий процент ошибок API"
          description: "Error rate > 1% за последние 5 минут"

      # Латентность API
      - alert: APIHighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Высокая латентность API (p95)"
          description: "p95 latency > 800ms за последние 10 минут"

      # Доступность (SLO)
      - alert: APIAvailabilityBelowSLO
        expr: |
          (
            sum(rate(http_requests_total{status=~"2..|3.."}[5m])) /
            sum(rate(http_requests_total[5m]))
          ) < 0.999
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Доступность API ниже SLO (99.9%)"
          description: "Availability < 99.9% за последние 10 минут"

  - name: database_alerts
    interval: 30s
    rules:
      # Соединения с БД
      - alert: DatabaseHighConnections
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Высокое количество соединений с БД"
          description: "Active connections > 80"

      # Размер БД
      - alert: DatabaseSizeHigh
        expr: pg_database_size_bytes > 50 * 1024 * 1024 * 1024  # 50GB
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Размер БД превышает 50GB"

  - name: infrastructure_alerts
    interval: 30s
    rules:
      # CPU
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Высокая загрузка CPU"
          description: "CPU usage > 80% за последние 10 минут"

      # RAM
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Высокая загрузка памяти"
          description: "Memory usage > 85% за последние 10 минут"

      # Disk
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Мало места на диске"
          description: "Disk space < 15%"
```

#### 5.3.2 Конфигурация Alertmanager

```yaml
# /etc/alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'warning'
    slack_configs:
      - channel: '#alerts'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### 5.4 Логирование (ELK/Loki)

#### 5.4.1 Структурированные логи

```python
# Уже настроено в settings.py (см. раздел 3.5.1)
# Логи в формате JSON для парсинга
```

#### 5.4.2 Filebeat конфигурация

```yaml
# /etc/filebeat/filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/django/*.log
    json.keys_under_root: true
    json.add_error_key: true
    fields:
      environment: production
      service: psychology-api

output.elasticsearch:
  hosts: ["elasticsearch.internal:9200"]
  index: "psychology-logs-%{+yyyy.MM.dd}"

processors:
  - drop_fields:
      fields: ["agent", "ecs", "host", "log"]
```

### 5.5 Трейсинг (Distributed Tracing)

#### 5.5.1 OpenTelemetry Integration

```python
# requirements.txt
opentelemetry-api==1.20.0
opentelemetry-sdk==1.20.0
opentelemetry-instrumentation-django==0.41b0
opentelemetry-exporter-jaeger==1.20.0

# settings.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.django import DjangoInstrumentor

# Инициализация
trace.set_tracer_provider(TracerProvider())
jaeger_exporter = JaegerExporter(
    agent_host_name='jaeger.internal',
    agent_port=6831,
)
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

# Инструментация Django
DjangoInstrumentor().instrument()
```

### 5.6 Дашборды (Grafana)

#### 5.6.1 Установка Grafana

```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

#### 5.6.2 Дашборды (Golden Paths)

**Дашборд 1: Golden Paths (G1-G4)**
- G1: Быстрый старт пользы (интерактивы)
- G2: Запись (booking flow)
- G3: Telegram-связка
- G4: Админ-операции

**Дашборд 2: Errors & Latency**
- Error rate по endpoints
- Latency (p50, p95, p99)
- Throughput (requests/sec)

**Дашборд 3: Integrations Health**
- Google Calendar API health
- ЮKassa webhooks status
- Telegram Bot API status
- Email delivery rate

---

## 6) Документация для пользователей

### 6.1 Структура документации

```
docs/user-docs/
├── README.md                    # Главная страница
├── getting-started/
│   ├── first-steps.md          # Первые шаги
│   ├── registration.md         # Регистрация
│   └── navigation.md            # Навигация по сайту
├── features/
│   ├── interactive-modules.md  # Интерактивные модули
│   ├── booking.md              # Запись на консультацию
│   ├── client-cabinet.md      # Личный кабинет
│   └── telegram-integration.md # Интеграция с Telegram
├── privacy/
│   ├── data-protection.md      # Защита данных
│   ├── consent-management.md   # Управление согласиями
│   └── data-export.md          # Экспорт данных
└── faq/
    ├── general.md              # Общие вопросы
    ├── booking.md              # Вопросы по записи
    └── technical.md           # Технические вопросы
```

### 6.2 Основные разделы

#### 6.2.1 Getting Started

**Содержание:**
- Что такое «Эмоциональный баланс»
- Как начать пользоваться
- Регистрация и вход
- Первые шаги после регистрации

#### 6.2.2 Features

**Интерактивные модули:**
- Квизы и диагностики
- Навигатор состояния
- Термометр ресурса
- Скрипты границ
- Дневники

**Запись на консультацию:**
- Выбор услуги
- Выбор времени
- Заполнение анкеты
- Оплата
- Подтверждение

**Личный кабинет:**
- Мои встречи
- Материалы
- Дневники
- Экспорт PDF
- Управление данными

#### 6.2.3 Privacy & Security

**Содержание:**
- Какие данные мы собираем
- Как мы защищаем данные
- Управление согласиями
- Экспорт данных
- Удаление аккаунта

### 6.3 Формат документации

- **Markdown** формат
- **Визуальные примеры** (скриншоты)
- **Пошаговые инструкции**
- **FAQ** раздел
- **Поиск** по документации

---

## 7) Документация для поддержки

### 7.1 Структура документации

```
docs/support-docs/
├── README.md                    # Главная страница
├── runbooks/
│   ├── common-issues.md        # Частые проблемы
│   ├── booking-issues.md       # Проблемы с записью
│   ├── payment-issues.md       # Проблемы с оплатой
│   └── telegram-issues.md      # Проблемы с Telegram
├── procedures/
│   ├── user-support.md         # Поддержка пользователей
│   ├── incident-response.md    # Реагирование на инциденты
│   └── escalation.md           # Эскалация проблем
├── troubleshooting/
│   ├── logs.md                 # Работа с логами
│   ├── monitoring.md           # Использование мониторинга
│   └── debugging.md            # Отладка проблем
└── knowledge-base/
    ├── system-overview.md      # Обзор системы
    ├── integrations.md         # Внешние интеграции
    └── data-model.md           # Модель данных
```

### 7.2 Runbooks

#### 7.2.1 Common Issues

**Проблема: Пользователь не может войти**
1. Проверить логи аутентификации
2. Проверить статус пользователя (active/blocked)
3. Проверить сессии (concurrent sessions limit)
4. Проверить MFA (если админ)

**Проблема: Ошибка при записи**
1. Проверить доступность слотов в Google Calendar
2. Проверить логи booking API
3. Проверить конфликты (double booking)
4. Проверить статус платежа

#### 7.2.2 Incident Response

**SEV-1 (Critical):**
- Система недоступна
- Невозможна запись/оплата
- Утечка данных

**Процедура:**
1. Обнаружение (мониторинг/пользователи)
2. Оценка (severity, impact)
3. Контейнирование (изоляция проблемы)
4. Исправление (workaround/fix)
5. Восстановление (проверка работоспособности)
6. Post-mortem (анализ и улучшения)

### 7.3 Troubleshooting Guides

#### 7.3.1 Работа с логами

```bash
# Просмотр логов Django
tail -f /var/log/django/app.log | jq

# Поиск ошибок
grep -i error /var/log/django/app.log | tail -100

# Фильтрация по request_id
grep "request_id=abc123" /var/log/django/app.log
```

#### 7.3.2 Использование мониторинга

- **Grafana:** Дашборды для анализа метрик
- **Prometheus:** Запросы метрик (PromQL)
- **Jaeger:** Трейсинг запросов
- **ELK:** Поиск по логам

---

## 8) Smoke Tests после деплоя

### 8.1 Чеклист Smoke Tests

#### 8.1.1 Инфраструктура

- [ ] Backend API доступен (health check)
- [ ] PostgreSQL доступна
- [ ] Redis доступен
- [ ] Статика отдаётся (CDN)
- [ ] Медиа доступны

#### 8.1.2 Функциональность

- [ ] Главная страница загружается
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Интерактивы запускаются
- [ ] Запись на консультацию работает
- [ ] Оплата работает (test mode)
- [ ] Личный кабинет доступен
- [ ] Админ-панель доступна

#### 8.1.3 Интеграции

- [ ] Google Calendar API отвечает
- [ ] ЮKassa webhooks принимаются
- [ ] Telegram Bot API работает
- [ ] Email отправляется

#### 8.1.4 Мониторинг

- [ ] Метрики собираются (Prometheus)
- [ ] Логи пишутся
- [ ] Алерты работают
- [ ] Дашборды обновляются

### 8.2 Автоматизированные Smoke Tests

```python
# tests/smoke/test_production.py
import pytest
import requests
from django.test import TestCase

BASE_URL = "https://example.com"

class SmokeTests(TestCase):
    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/health/")
        assert response.status_code == 200

    def test_homepage(self):
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "Эмоциональный баланс" in response.text

    def test_api_health(self):
        response = requests.get(f"{BASE_URL}/api/v1/health/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_static_files(self):
        response = requests.get(f"{BASE_URL}/static/css/main.css")
        assert response.status_code == 200

    def test_media_files(self):
        # Проверка доступности медиа
        response = requests.get(f"{BASE_URL}/media/test.jpg", allow_redirects=False)
        assert response.status_code in [200, 404]  # 404 допустим для теста

    def test_database_connection(self):
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            assert cursor.fetchone()[0] == 1

    def test_redis_connection(self):
        from django.core.cache import cache
        cache.set("smoke_test", "ok", 10)
        assert cache.get("smoke_test") == "ok"
```

**Запуск:**
```bash
pytest tests/smoke/test_production.py -v
```

### 8.3 Manual Smoke Tests

**Чеклист для ручного тестирования:**

1. **Главная страница:**
   - [ ] Загружается быстро (< 3s)
   - [ ] Все секции отображаются
   - [ ] Ссылки работают
   - [ ] Интерактивы запускаются

2. **Запись на консультацию:**
   - [ ] Услуги отображаются
   - [ ] Слоты доступны
   - [ ] Анкета заполняется
   - [ ] Оплата проходит (test mode)
   - [ ] Подтверждение приходит

3. **Личный кабинет:**
   - [ ] Вход работает
   - [ ] Встречи отображаются
   - [ ] Материалы доступны
   - [ ] Дневники работают

4. **Админ-панель:**
   - [ ] Вход с MFA работает
   - [ ] Все разделы доступны
   - [ ] CRUD операции работают

---

## 9) Go Live процедуры

### 9.1 Pre-Go-Live Checklist

#### 9.1.1 Техническая готовность

- [ ] Все компоненты развёрнуты в production
- [ ] Миграции БД применены
- [ ] Мониторинг настроен и работает
- [ ] Бэкапы настроены и протестированы
- [ ] SSL сертификаты установлены
- [ ] DNS настроен
- [ ] CDN настроен
- [ ] Smoke tests пройдены

#### 9.1.2 Функциональная готовность

- [ ] Все P0 фичи реализованы
- [ ] Все тесты проходят
- [ ] Нет критичных багов
- [ ] Performance требования выполнены
- [ ] Security требования выполнены
- [ ] A11y требования выполнены

#### 9.1.3 Документация

- [ ] Документация для пользователей готова
- [ ] Документация для поддержки готова
- [ ] Runbooks готовы
- [ ] Инструкции для команды готовы

#### 9.1.4 Команда

- [ ] Команда на связи
- [ ] On-call ротация настроена
- [ ] Эскалация настроена
- [ ] Коммуникационные каналы готовы (Slack, PagerDuty)

### 9.2 Go Live Plan

#### 9.2.1 День -1 (Pre-Go-Live)

**Время:** За день до запуска

**Задачи:**
- [ ] Финальная проверка всех компонентов
- [ ] Тестирование бэкапов
- [ ] Проверка мониторинга
- [ ] Информирование команды
- [ ] Подготовка rollback плана

#### 9.2.2 День 0 (Go Live)

**Время:** Окно обслуживания (например, 02:00-04:00 UTC)

**Шаги:**

1. **02:00 - Финальный бэкап**
   ```bash
   pg_dump -h postgres.internal -U psychology_user -d psychology_prod \
       -F c -f /var/backups/go_live_$(date +%Y%m%d_%H%M%S).dump
   ```

2. **02:15 - Применение миграций**
   ```bash
   python manage.py migrate --no-input
   ```

3. **02:30 - Деплой backend**
   ```bash
   git pull origin main
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py collectstatic --no-input
   sudo systemctl restart psychology-api
   ```

4. **02:45 - Переключение DNS**
   - Обновление DNS записей
   - Ожидание распространения (TTL)

5. **03:00 - Smoke tests**
   ```bash
   pytest tests/smoke/test_production.py -v
   ```

6. **03:30 - Мониторинг**
   - Проверка метрик
   - Проверка логов
   - Проверка алертов

#### 9.2.3 День +1 (Post-Go-Live)

**Время:** Первые 24 часа после запуска

**Задачи:**
- [ ] Непрерывный мониторинг
- [ ] Быстрое реагирование на инциденты
- [ ] Сбор обратной связи
- [ ] Анализ метрик
- [ ] Post-mortem (если были инциденты)

### 9.3 Rollback Plan

#### 9.3.1 Условия для rollback

- Критичные ошибки (SEV-1)
- Невозможность восстановления в течение 1 часа
- Потеря данных
- Нарушение безопасности

#### 9.3.2 Процедура rollback

1. **Остановка деплоя**
   ```bash
   sudo systemctl stop psychology-api
   ```

2. **Откат к предыдущей версии**
   ```bash
   git checkout <previous_commit>
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py collectstatic --no-input
   sudo systemctl start psychology-api
   ```

3. **Откат миграций (если требуется)**
   ```bash
   python manage.py migrate app_name <previous_migration>
   ```

4. **Восстановление из бэкапа (крайний случай)**
   ```bash
   pg_restore -h postgres.internal -U psychology_user -d psychology_prod \
       -c /var/backups/go_live_*.dump
   ```

5. **Проверка работоспособности**
   ```bash
   pytest tests/smoke/test_production.py -v
   ```

### 9.4 Communication Plan

#### 9.4.1 Внутренняя коммуникация

- **Slack канал:** #production-deployments
- **PagerDuty:** Для критичных алертов
- **Email:** Для уведомлений команды

#### 9.4.2 Внешняя коммуникация

- **Status page:** Обновление статуса для пользователей
- **Email:** Уведомления о плановом обслуживании
- **Telegram:** Уведомления в канале (если применимо)

---

## 10) Post-Deployment проверки

### 10.1 Первые 24 часа

- [ ] Мониторинг метрик (каждые 15 минут)
- [ ] Проверка логов на ошибки
- [ ] Проверка алертов
- [ ] Проверка производительности
- [ ] Проверка интеграций

### 10.2 Первая неделя

- [ ] Ежедневный анализ метрик
- [ ] Проверка SLO (доступность, латентность)
- [ ] Анализ пользовательской активности
- [ ] Сбор обратной связи
- [ ] Оптимизация (если требуется)

### 10.3 Первый месяц

- [ ] Месячный отчёт по SLO
- [ ] Анализ трендов
- [ ] Планирование улучшений
- [ ] Обновление документации
- [ ] Обучение команды

---

## 11) Чеклист готовности к Go Live

### 11.1 Техническая готовность

- [ ] Production окружение настроено
- [ ] Все сервисы развёрнуты
- [ ] Миграции БД применены
- [ ] SSL сертификаты установлены
- [ ] DNS настроен
- [ ] CDN настроен
- [ ] Мониторинг работает
- [ ] Алерты настроены
- [ ] Бэкапы настроены
- [ ] Smoke tests проходят

### 11.2 Функциональная готовность

- [ ] Все P0 фичи реализованы
- [ ] Все тесты проходят
- [ ] Нет критичных багов
- [ ] Performance требования выполнены
- [ ] Security требования выполнены
- [ ] A11y требования выполнены

### 11.3 Документация

- [ ] Документация для пользователей готова
- [ ] Документация для поддержки готова
- [ ] Runbooks готовы
- [ ] Инструкции для команды готовы

### 11.4 Команда

- [ ] Команда на связи
- [ ] On-call ротация настроена
- [ ] Эскалация настроена
- [ ] Коммуникационные каналы готовы

---

## 12) Ссылки на связанные документы

- **Development Plan:** `docs/Development-Phase-Plan.md`
- **NFR/SLO:** `docs/NFR-SLO-SLI-Performance-Security-Scalability.md`
- **Security Requirements:** `docs/security/security-requirements.md`
- **Architecture:** `docs/Архитектурный-обзор.md`
- **Deployment Diagrams:** `docs/Диаграммы-C4-Sequence-Deployment.md`
- **Data Model:** `docs/Модель-данных.md`
- **Technical Decisions:** `docs/Technical-Decisions.md`

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Готов к использованию

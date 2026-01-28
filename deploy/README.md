# Инфраструктура деплоя — «Эмоциональный баланс»

Краткая инструкция по развёртыванию в production. Полная спецификация: [docs/Phase-8-Deployment-GoLive-Technical-Spec.md](../docs/Phase-8-Deployment-GoLive-Technical-Spec.md).

## Что есть в репозитории

| Артефакт | Назначение |
|----------|------------|
| `deploy/.env.production.example` | Шаблон переменных окружения для prod (скопировать в `.env.production` на сервере) |
| `deploy/.env.servers.example` | Шаблон SSH/путей (скопировать в корень репо как `.env.servers`) |
| `deploy/deploy-dev.sh` | Деплой на dev-сервер |
| `deploy/deploy-prod.sh` | Деплой на prod (с бэкапом БД) |
| `deploy/bootstrap-server.sh` | Первичная настройка Ubuntu-сервера (PostgreSQL, Redis, Nginx, venv, systemd) |
| `backend/infrastructure/deploy/` | Nginx, systemd unit, скрипты бэкапа/восстановления БД |
| `backend/config/settings/production.py` | Django production settings |
| `backend/gunicorn_config.py` | Gunicorn для production |
| `docker-compose.prod.yml` | Референс: backend + PostgreSQL + Redis в Docker (логи в stdout) |
| `.github/workflows/deploy-prod.yml` | CI: деплой на prod по push в main (нужны секреты PROD_SSH_*) |

## Быстрый старт (Production)

### 1. Подготовка локально

- Скопировать `deploy/.env.servers.example` → `.env.servers` в корне репо, заполнить хосты и ключи.
- Скопировать `deploy/.env.production.example` → на сервер в `/var/www/psychology/.env.production` и заполнить (в т.ч. `SECRET_KEY`, `DB_*`, `REDIS_HOST`).

### 2. Первый раз: bootstrap сервера

На **новый** VPS (Ubuntu 22.04/24.04):

```bash
# Скопировать скрипт на сервер и выполнить от root или через sudo
scp deploy/bootstrap-server.sh user@your-server:/tmp/
ssh user@your-server 'sudo bash /tmp/bootstrap-server.sh'
```

Скрипт установит: PostgreSQL, Redis, Nginx, Python 3.11, создаст пользователя и БД, директории, systemd unit. После этого вручную:

- Разместить код в `/var/www/psychology` (git clone или rsync).
- Создать venv: `python3.11 -m venv /var/www/psychology/venv`, `pip install -r backend/requirements.txt`.
- Положить `.env.production` в `/var/www/psychology/`.
- Подключить конфиги из `backend/infrastructure/deploy/`: nginx → `/etc/nginx/sites-available/psychology`, systemd → `/etc/systemd/system/psychology-api.service`, затем `systemctl daemon-reload && systemctl enable psychology-api nginx`.
- Выпустить SSL (certbot): `sudo certbot --nginx -d example.com`.
- Запустить: `sudo systemctl start psychology-api nginx`, применить миграции и `collectstatic`.

### 3. Обычный деплой (уже настроенный сервер)

```bash
./deploy/deploy-prod.sh
```

### 4. balance-space.ru: Docker (frontend + backend)

- **frontend** (SPA): порт 8082, раздача Vite-сборки через nginx в контейнере.
- **backend** (Django API): порт 8001 (на сервере при занятом 8000 — в compose задать `8001:8000`).

Запуск: переменные `DB_PASSWORD`, `DB_NAME`, `DB_USER` подставляются в compose из файла. Используйте **`--env-file .env.production`**:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Без `--env-file .env.production` нужен файл `.env` в каталоге проекта с хотя бы `DB_PASSWORD=...`.

После запуска контейнеров применить nginx:

**На сервере (с sudo):**
```bash
sudo cp /var/www/psychology/backend/infrastructure/deploy/nginx-balance-space.ru.conf /etc/nginx/sites-available/balance-space.ru
sudo nginx -t && sudo systemctl reload nginx
```
Или: `sudo bash /var/www/psychology/deploy/apply-nginx-balance.sh`

Nginx: `/` и статика SPA → 127.0.0.1:8082 (frontend; на сервере при занятом 8082 использовать 8084), `/api/`, `/admin/`, `/health/`, `/static/`, `/media/` → 127.0.0.1:8001 (backend).

Перед деплоем создаётся бэкап БД в `$PROJECT_PATH/backups/`. Откат: см. [.cursor/skills/vps-deploy/SKILL.md](../.cursor/skills/vps-deploy/SKILL.md) и `backend/infrastructure/deploy/restore_postgres.sh`.

## Бэкапы

- Ежедневный бэкап: cron на сервере, вызывающий `backend/infrastructure/deploy/backup_postgres.sh` (или свой скрипт по Phase-8 spec).
- Восстановление: `backend/infrastructure/deploy/restore_postgres.sh` (см. комментарии внутри).

## Мониторинг

- Health: `GET /health/` и `GET /api/v1/health/`.
- Метрики Prometheus: при включённом `django-prometheus` — endpoint из конфига (например `/metrics`).
- Логи: `journalctl -u psychology-api`, приложение пишет в `/var/log/django/app.log` (см. production.py).

## GitHub Actions (деплой по push в main)

В репозитории: **Settings → Secrets and variables → Actions** задать:

- **Secrets:** `PROD_SSH_HOST`, `PROD_SSH_USER`, `PROD_SSH_PRIVATE_KEY` (приватный SSH-ключ целиком).
- **Variables (опционально):** `PROD_PROJECT_PATH` (по умолчанию `/var/www/psychology`), `PROD_DB_NAME` (по умолчанию `psychology_prod`).

После push в `main` workflow выполнит бэкап БД, pull, миграции, collectstatic и перезапуск сервиса, затем проверку `/api/v1/health/`.

## Полезные ссылки

- [Phase 8: Deployment & Go Live](../docs/Phase-8-Deployment-GoLive-Technical-Spec.md)
- [Go Live Plan](../docs/GO_LIVE_PLAN.md)
- [VPS Deploy Skill](../.cursor/skills/vps-deploy/SKILL.md)

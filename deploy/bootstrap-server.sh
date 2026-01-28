#!/usr/bin/env bash
# Первичная настройка Ubuntu 22.04/24.04 для «Эмоциональный баланс».
# Запуск: на сервере от root или sudo bash bootstrap-server.sh
# После выполнения: развернуть код, .env.production, venv, nginx/systemd конфиги и запустить сервисы.

set -e

export DEBIAN_FRONTEND=noninteractive
PROJECT_PATH="${PROJECT_PATH:-/var/www/psychology}"
APP_USER="${APP_USER:-www-data}"

echo "Обновление пакетов..."
apt-get update -qq && apt-get upgrade -y -qq

echo "Установка зависимостей..."
apt-get install -y -qq \
  build-essential \
  libpq-dev \
  python3.11 \
  python3.11-venv \
  python3-pip \
  postgresql \
  postgresql-contrib \
  redis-server \
  nginx \
  certbot \
  python3-certbot-nginx \
  git \
  curl

echo "Настройка PostgreSQL..."
sudo -u postgres psql -c "CREATE USER psychology_user WITH PASSWORD 'CHANGE_ME_IN_ENV';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE psychology_prod OWNER psychology_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE psychology_prod TO psychology_user;"
echo "local   psychology_prod   psychology_user   md5" >> /etc/postgresql/*/main/pg_hba.conf 2>/dev/null || true
systemctl enable postgresql && systemctl start postgresql

echo "Настройка Redis..."
systemctl enable redis-server && systemctl start redis-server

echo "Создание директорий и прав..."
mkdir -p "$PROJECT_PATH"/{backend,frontend,logs,backups,static,media}
mkdir -p /var/log/django /var/log/gunicorn
chown -R "$APP_USER:$APP_USER" "$PROJECT_PATH" /var/log/django /var/log/gunicorn 2>/dev/null || true

echo "Готово. Дальше вручную:"
echo "  1. Разместить код в $PROJECT_PATH (git clone / rsync)"
echo "  2. python3.11 -m venv $PROJECT_PATH/venv && $PROJECT_PATH/venv/bin/pip install -r $PROJECT_PATH/backend/requirements.txt"
echo "  3. Создать $PROJECT_PATH/.env.production (см. deploy/.env.production.example)"
echo "  4. Скопировать backend/infrastructure/deploy/nginx.conf → /etc/nginx/sites-available/psychology, отредактировать server_name, включить site"
echo "  5. Скопировать backend/infrastructure/deploy/psychology-api.service → /etc/systemd/system/, systemctl daemon-reload enable start psychology-api"
echo "  6. certbot --nginx -d your-domain.com"
echo "  7. В $PROJECT_PATH: . venv/bin/activate && cd backend && python manage.py migrate && python manage.py collectstatic --no-input"

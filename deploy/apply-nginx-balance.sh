#!/bin/bash
# Применить nginx config для balance-space.ru (прокси на backend :8001).
# Запускать на сервере с sudo: sudo bash deploy/apply-nginx-balance.sh
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
NGINX_CONF="$PROJECT_ROOT/backend/infrastructure/deploy/nginx-balance-space.ru.conf"
if [ ! -f "$NGINX_CONF" ]; then
  echo "Not found: $NGINX_CONF"
  exit 1
fi
cp "$NGINX_CONF" /etc/nginx/sites-available/balance-space.ru
nginx -t
systemctl reload nginx
echo "Nginx reloaded. balance-space.ru now proxies to 127.0.0.1:8001"

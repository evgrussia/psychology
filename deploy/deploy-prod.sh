#!/usr/bin/env bash
# Deploy на Production сервер. ОБЯЗАТЕЛЬНО создаёт бэкап БД перед деплоем.
# Использование: из корня репо ./deploy/deploy-prod.sh
# Требует: .env.servers в корне репо

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ -f .env.servers ]; then
  # shellcheck source=/dev/null
  source .env.servers
elif [ -z "$PROD_SSH_HOST" ]; then
  echo "Ошибка: .env.servers не найден и переменные PROD_SSH_* не заданы."
  exit 1
fi

PROJECT_PATH="${PROD_PROJECT_PATH:-/var/www/psychology}"
DB_NAME="${PROD_DB_NAME:-psychology_prod}"

ssh_exec() {
  if [ -n "$PROD_SSH_KEY_PATH" ]; then
    ssh -i "$PROD_SSH_KEY_PATH" -o StrictHostKeyChecking=no "$PROD_SSH_USER@$PROD_SSH_HOST" "$@"
  else
    ssh -o StrictHostKeyChecking=no "$PROD_SSH_USER@$PROD_SSH_HOST" "$@"
  fi
}

echo "=== Production Deploy ==="
if [ -z "$SKIP_CONFIRM" ]; then
  read -p "Продолжить? (yes/no): " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "Отменено."
    exit 1
  fi
fi

# Pre-checks
ssh_exec "systemctl is-active psychology-api nginx postgresql redis-server 2>/dev/null || true"

# Backup (MANDATORY)
BACKUP_NAME="pre_deploy_$(date +%Y%m%d_%H%M%S)"
echo "Создание бэкапа БД: $BACKUP_NAME"
ssh_exec "mkdir -p $PROJECT_PATH/backups && sudo -u postgres pg_dump $DB_NAME | gzip > $PROJECT_PATH/backups/${BACKUP_NAME}.sql.gz"
echo "Бэкап: $PROJECT_PATH/backups/${BACKUP_NAME}.sql.gz"

# Deploy backend
ssh_exec "cd $PROJECT_PATH/backend && git fetch origin && git checkout main && git pull origin main"
ssh_exec "cd $PROJECT_PATH && . venv/bin/activate && cd backend && pip install -r requirements.txt -q && python manage.py migrate --no-input && python manage.py collectstatic --no-input"
ssh_exec "sudo systemctl restart psychology-api"

# Smoke
sleep 3
CODE=$(ssh_exec "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/health/" || true)
if [ "$CODE" = "200" ]; then
  echo "OK: API health 200"
else
  echo "ВНИМАНИЕ: API health вернул $CODE. Проверьте логи: ssh $PROD_SSH_USER@$PROD_SSH_HOST 'journalctl -u psychology-api -n 50 --no-pager'"
fi

echo "Production deploy завершён. Backup: $BACKUP_NAME"

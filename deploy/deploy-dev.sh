#!/usr/bin/env bash
# Deploy на Development сервер.
# Использование: из корня репо ./deploy/deploy-dev.sh
# Требует: .env.servers в корне репо (см. .env.servers.example)

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -f .env.servers ]; then
  echo "Ошибка: .env.servers не найден. Скопируйте deploy/.env.servers.example в .env.servers и заполните."
  exit 1
fi
# shellcheck source=/dev/null
source .env.servers

ENV=dev
PROJECT_PATH="$DEV_PROJECT_PATH"
DB_NAME="$DEV_DB_NAME"

ssh_exec() {
  ssh -i "$DEV_SSH_KEY_PATH" -o StrictHostKeyChecking=no "$DEV_SSH_USER@$DEV_SSH_HOST" "$@"
}

echo "Deploy на Development..."

# Pre-checks
ssh_exec "test -d $PROJECT_PATH/backend || (echo 'Ошибка: проект не развёрнут на сервере'; exit 1)"

# Backend
ssh_exec "cd $PROJECT_PATH/backend && git fetch origin && git checkout main && git pull origin main"
ssh_exec "cd $PROJECT_PATH && . venv/bin/activate && cd backend && pip install -r requirements.txt -q && python manage.py migrate --no-input && python manage.py collectstatic --no-input"
ssh_exec "sudo systemctl restart psychology-api"

# Smoke
CODE=$(ssh_exec "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/health/" || true)
if [ "$CODE" = "200" ]; then
  echo "OK: API health 200"
else
  echo "Предупреждение: API health вернул $CODE"
fi

echo "Deploy dev завершён."

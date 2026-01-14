#!/bin/bash

# ============================================
# Скрипт начальной настройки сервера
# Server Setup Script for Psychology Platform
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка, что скрипт запущен от root
if [[ $EUID -ne 0 ]]; then
   print_error "Этот скрипт должен быть запущен от root"
   exit 1
fi

print_info "============================================"
print_info "Начало настройки сервера для Psychology Platform"
print_info "============================================"

# ============================================
# 1. Обновление системы
# ============================================
print_info "Обновление системы..."
apt update
apt upgrade -y
apt install -y curl wget git nano htop net-tools ufw
print_success "Система обновлена"

# ============================================
# 2. Создание пользователя deploy
# ============================================
print_info "Создание пользователя deploy..."
if id "deploy" &>/dev/null; then
    print_warning "Пользователь deploy уже существует"
else
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    print_success "Пользователь deploy создан"
fi

# Настройка SSH для deploy
if [ ! -d "/home/deploy/.ssh" ]; then
    mkdir -p /home/deploy/.ssh
    if [ -f "/root/.ssh/authorized_keys" ]; then
        cp /root/.ssh/authorized_keys /home/deploy/.ssh/
        chown -R deploy:deploy /home/deploy/.ssh
        chmod 700 /home/deploy/.ssh
        chmod 600 /home/deploy/.ssh/authorized_keys
        print_success "SSH ключи скопированы для пользователя deploy"
    fi
fi

# ============================================
# 3. Настройка файрвола
# ============================================
print_info "Настройка файрвола..."
ufw --force disable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Файрвол настроен"

# ============================================
# 4. Установка Docker
# ============================================
print_info "Установка Docker..."

# Удаляем старые версии
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Устанавливаем зависимости
apt install -y ca-certificates gnupg lsb-release

# Добавляем GPG ключ Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавляем репозиторий
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавляем deploy в группу docker
usermod -aG docker deploy

# Настраиваем Docker
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker
systemctl enable docker

print_success "Docker установлен"
docker --version
docker compose version

# ============================================
# 5. Установка Certbot
# ============================================
print_info "Установка Certbot..."
apt install -y certbot python3-certbot-nginx
print_success "Certbot установлен"

# ============================================
# 6. Создание директорий проекта
# ============================================
print_info "Создание директорий проекта..."
mkdir -p /var/www/psychology
mkdir -p /var/backups/psychology
mkdir -p /var/log/psychology
chown -R deploy:deploy /var/www/psychology
chown -R deploy:deploy /var/backups/psychology
chown -R deploy:deploy /var/log/psychology
print_success "Директории созданы"

# ============================================
# 7. Настройка логирования
# ============================================
print_info "Настройка ротации логов..."
cat > /etc/logrotate.d/psychology <<EOF
/var/log/psychology/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
}
EOF
print_success "Ротация логов настроена"

# ============================================
# 8. Настройка swap (если меньше 4GB RAM)
# ============================================
TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_MEM" -lt 4 ]; then
    print_info "Памяти меньше 4GB, создаем swap файл..."
    if [ ! -f /swapfile ]; then
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        print_success "Swap файл создан (2GB)"
    else
        print_warning "Swap файл уже существует"
    fi
fi

# ============================================
# 9. Настройка автоматического обновления системы
# ============================================
print_info "Настройка автоматических обновлений безопасности..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
print_success "Автоматические обновления настроены"

# ============================================
# 10. Установка мониторинга
# ============================================
print_info "Установка инструментов мониторинга..."
apt install -y htop iotop iftop nethogs
print_success "Инструменты мониторинга установлены"

# ============================================
# Финальные инструкции
# ============================================
print_success "============================================"
print_success "Настройка сервера завершена!"
print_success "============================================"
echo ""
print_info "Следующие шаги:"
echo ""
print_info "1. Настройте DNS записи для домена balance-space.ru:"
echo "   - @ A 213.159.67.199"
echo "   - www A 213.159.67.199"
echo "   - admin A 213.159.67.199"
echo "   - api A 213.159.67.199"
echo ""
print_info "2. Получите SSL сертификаты (замените email):"
echo "   certbot certonly --standalone -d balance-space.ru -d www.balance-space.ru -d admin.balance-space.ru -d api.balance-space.ru --email your-email@example.com --agree-tos"
echo ""
print_info "3. Переключитесь на пользователя deploy:"
echo "   su - deploy"
echo ""
print_info "4. Склонируйте репозиторий:"
echo "   cd /var/www/psychology"
echo "   git clone -b main YOUR_GIT_REPO_URL ."
echo ""
print_info "5. Создайте и настройте .env.prod файл:"
echo "   cp env.prod.example .env.prod"
echo "   nano .env.prod"
echo ""
print_info "6. Создайте символические ссылки для SSL (от root):"
echo "   sudo mkdir -p /var/www/psychology/nginx/ssl"
echo "   sudo ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/fullchain.pem"
echo "   sudo ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/privkey.pem"
echo ""
print_info "7. Запустите деплой:"
echo "   chmod +x /var/www/psychology/scripts/deploy.sh"
echo "   /var/www/psychology/scripts/deploy.sh deploy"
echo ""
print_success "Удачи!"

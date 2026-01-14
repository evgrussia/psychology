# Инструкция по деплою Psychology Platform на Dev Server

## ⚠️ Важно: Выберите подходящую инструкцию

### У вас ЧИСТЫЙ сервер без Nginx?
👉 **Следуйте этой инструкции ниже**

### У вас УЖЕ установлен Nginx и есть другие проекты?
👉 **Используйте инструкцию**: [DEPLOYMENT-EXISTING-NGINX.md](./DEPLOYMENT-EXISTING-NGINX.md)

---

## Информация о сервере

- **Сервер**: VPS Ubuntu 24.04
- **Домен**: balance-space.ru
- **IP адрес**: 213.159.67.199
- **Окружение**: Development

## Содержание

1. [Подготовка сервера](#1-подготовка-сервера)
2. [Установка зависимостей](#2-установка-зависимостей)
3. [Настройка DNS](#3-настройка-dns)
4. [Настройка SSL сертификатов](#4-настройка-ssl-сертификатов)
5. [Клонирование и настройка проекта](#5-клонирование-и-настройка-проекта)
6. [Деплой приложения](#6-деплой-приложения)
7. [Проверка работоспособности](#7-проверка-работоспособности)
8. [Обслуживание и мониторинг](#8-обслуживание-и-мониторинг)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Подготовка сервера

### 1.1 Подключение к серверу

```bash
ssh root@213.159.67.199
```

### 1.2 Обновление системы

```bash
apt update && apt upgrade -y
apt install -y curl wget git nano htop
```

### 1.3 Создание пользователя для деплоя

```bash
# Создаем пользователя deploy
adduser deploy

# Добавляем в группу sudo
usermod -aG sudo deploy

# Настраиваем SSH доступ для deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 1.4 Настройка файрвола

```bash
# Устанавливаем UFW
apt install -y ufw

# Разрешаем SSH, HTTP и HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Включаем файрвол
ufw --force enable

# Проверяем статус
ufw status
```

---

## 2. Установка зависимостей

### 2.1 Установка Docker

```bash
# Удаляем старые версии
apt remove -y docker docker-engine docker.io containerd runc

# Устанавливаем зависимости
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Добавляем официальный GPG ключ Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавляем репозиторий Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавляем пользователя deploy в группу docker
usermod -aG docker deploy

# Проверяем установку
docker --version
docker compose version
```

### 2.2 Настройка Docker

```bash
# Создаем конфигурацию Docker
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Перезапускаем Docker
systemctl restart docker
systemctl enable docker
```

### 2.3 Установка Git

```bash
apt install -y git
git --version
```

---

## 3. Настройка DNS

### 3.1 Настройка A-записей

В панели управления вашего DNS провайдера создайте следующие A-записи:

| Имя | Тип | Значение | TTL |
|-----|-----|----------|-----|
| @ | A | 213.159.67.199 | 3600 |
| www | A | 213.159.67.199 | 3600 |
| admin | A | 213.159.67.199 | 3600 |
| api | A | 213.159.67.199 | 3600 |

### 3.2 Проверка DNS

```bash
# Проверяем разрешение доменов
nslookup balance-space.ru
nslookup www.balance-space.ru
nslookup admin.balance-space.ru
nslookup api.balance-space.ru
```

Подождите 5-10 минут для распространения DNS записей.

---

## 4. Настройка SSL сертификатов

### 4.1 Установка Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 4.2 Получение SSL сертификатов

```bash
# Останавливаем Nginx если запущен
systemctl stop nginx 2>/dev/null || true

# Получаем сертификаты для всех доменов
certbot certonly --standalone \
  -d balance-space.ru \
  -d www.balance-space.ru \
  -d admin.balance-space.ru \
  -d api.balance-space.ru \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com

# Проверяем сертификаты
ls -la /etc/letsencrypt/live/balance-space.ru/
```

### 4.3 Создание символических ссылок для Nginx

```bash
# Создаем директорию для SSL в проекте
mkdir -p /var/www/psychology/nginx/ssl

# Создаем символические ссылки
ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/fullchain.pem
ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/privkey.pem
```

### 4.4 Автоматическое обновление сертификатов

```bash
# Проверяем автоматическое обновление
systemctl status certbot.timer

# Тестируем обновление
certbot renew --dry-run
```

---

## 5. Клонирование и настройка проекта

### 5.1 Переключение на пользователя deploy

```bash
su - deploy
```

### 5.2 Создание директории проекта

```bash
sudo mkdir -p /var/www/psychology
sudo chown deploy:deploy /var/www/psychology
cd /var/www/psychology
```

### 5.3 Клонирование репозитория

```bash
# Замените URL на ваш репозиторий
git clone -b main https://github.com/yourusername/psychology.git .

# Или если используете SSH
git clone -b main git@github.com:yourusername/psychology.git .
```

### 5.4 Создание файла окружения

```bash
# Копируем пример
cp env.prod.example .env.prod

# Редактируем файл
nano .env.prod
```

**Обязательно измените следующие значения:**

```bash
# База данных
DB_USER=psychology_user
DB_PASSWORD=<сгенерируйте_сложный_пароль>
DB_NAME=psychology_prod

# Redis
REDIS_PASSWORD=<сгенерируйте_сложный_пароль>

# Безопасность (генерируйте с помощью: openssl rand -base64 64)
JWT_SECRET=<сгенерируйте_случайную_строку>
SESSION_SECRET=<сгенерируйте_случайную_строку>

# URL (должны соответствовать вашему домену)
API_URL=https://api.balance-space.ru
SITE_URL=https://balance-space.ru
ADMIN_URL=https://admin.balance-space.ru
NEXT_PUBLIC_API_URL=https://balance-space.ru/api
NEXT_PUBLIC_SITE_URL=https://balance-space.ru
NEXT_PUBLIC_ADMIN_URL=https://admin.balance-space.ru
```

**Генерация безопасных паролей:**

```bash
# JWT Secret
openssl rand -base64 64

# Session Secret
openssl rand -base64 64

# Database Password
openssl rand -base64 32

# Redis Password
openssl rand -base64 32
```

### 5.5 Настройка директорий

```bash
# Создаем директории для логов и бэкапов
sudo mkdir -p /var/www/psychology/nginx/logs
sudo mkdir -p /var/backups/psychology
sudo chown -R deploy:deploy /var/www/psychology
sudo chown deploy:deploy /var/backups/psychology

# Делаем скрипт деплоя исполняемым
chmod +x /var/www/psychology/scripts/deploy.sh
```

---

## 6. Деплой приложения

### 6.1 Первоначальный деплой

```bash
cd /var/www/psychology

# Запускаем скрипт деплоя
./scripts/deploy.sh deploy
```

Скрипт выполнит следующие шаги:
1. ✅ Проверит зависимости
2. ✅ Проверит файл окружения
3. ✅ Создаст резервную копию БД (если существует)
4. ✅ Обновит код из Git
5. ✅ Остановит старые контейнеры
6. ✅ Соберет Docker образы
7. ✅ Применит миграции БД
8. ✅ Запустит контейнеры
9. ✅ Проверит здоровье сервисов

### 6.2 Мониторинг процесса деплоя

Процесс деплоя может занять 10-15 минут в зависимости от скорости сервера.

### 6.3 Проверка запущенных контейнеров

```bash
docker ps
```

Должны быть запущены следующие контейнеры:
- `psychology-prod-db` (PostgreSQL)
- `psychology-prod-redis` (Redis)
- `psychology-prod-api` (Backend API)
- `psychology-prod-web` (Frontend Web)
- `psychology-prod-admin` (Admin Panel)
- `psychology-prod-nginx` (Nginx)

---

## 7. Проверка работоспособности

### 7.1 Проверка API

```bash
# Health check
curl http://localhost/api/health

# Версия API
curl http://localhost/api/version

# Через домен
curl https://balance-space.ru/api/health
```

### 7.2 Проверка Frontend

```bash
# Основной сайт
curl -I https://balance-space.ru

# Admin панель
curl -I https://admin.balance-space.ru
```

### 7.3 Проверка в браузере

Откройте в браузере:
- **Основной сайт**: https://balance-space.ru
- **Admin панель**: https://admin.balance-space.ru
- **API Swagger**: https://balance-space.ru/api/docs

### 7.4 Проверка логов

```bash
# Все логи
docker compose -f docker-compose.prod.yml logs

# Логи конкретного сервиса
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs nginx

# Следить за логами в реальном времени
docker compose -f docker-compose.prod.yml logs -f
```

---

## 8. Обслуживание и мониторинг

### 8.1 Команды управления

```bash
# Просмотр логов
./scripts/deploy.sh logs

# Статус контейнеров
./scripts/deploy.sh status

# Перезапуск контейнеров
./scripts/deploy.sh restart

# Остановка контейнеров
./scripts/deploy.sh stop

# Создание резервной копии БД
./scripts/deploy.sh backup
```

### 8.2 Обновление приложения

```bash
cd /var/www/psychology

# Запускаем деплой (обновит код и перезапустит)
./scripts/deploy.sh deploy
```

### 8.3 Резервное копирование

**Автоматическое резервное копирование:**

Создайте cron задачу для автоматического бэкапа:

```bash
# Открываем crontab
crontab -e

# Добавляем задачу (каждый день в 3:00 утра)
0 3 * * * /var/www/psychology/scripts/deploy.sh backup >> /var/log/psychology-backup.log 2>&1
```

**Ручное резервное копирование:**

```bash
# Резервная копия базы данных
./scripts/deploy.sh backup

# Резервная копия медиа файлов
docker run --rm -v psychology_media_data:/data -v /var/backups/psychology:/backup \
  ubuntu tar czf /backup/media_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### 8.4 Восстановление из резервной копии

```bash
# Список доступных бэкапов
ls -lah /var/backups/psychology/

# Восстановление БД
gunzip < /var/backups/psychology/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i psychology-prod-db psql -U psychology_user -d psychology_prod
```

### 8.5 Мониторинг ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Использование диска
df -h

# Размер томов Docker
docker system df -v
```

### 8.6 Очистка системы

```bash
# Очистка неиспользуемых Docker ресурсов
docker system prune -a --volumes -f

# Очистка старых логов
find /var/www/psychology/nginx/logs -name "*.log" -mtime +30 -delete
```

---

## 9. Troubleshooting

### 9.1 Проблема: Контейнеры не запускаются

**Решение:**

```bash
# Проверяем логи
docker compose -f docker-compose.prod.yml logs

# Проверяем статус
docker compose -f docker-compose.prod.yml ps

# Перезапускаем
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### 9.2 Проблема: Ошибка подключения к базе данных

**Решение:**

```bash
# Проверяем, запущен ли контейнер БД
docker ps | grep psychology-prod-db

# Проверяем логи БД
docker logs psychology-prod-db

# Проверяем подключение
docker exec -it psychology-prod-db psql -U psychology_user -d psychology_prod
```

### 9.3 Проблема: 502 Bad Gateway

**Решение:**

```bash
# Проверяем, запущены ли backend сервисы
docker ps

# Проверяем логи Nginx
docker logs psychology-prod-nginx

# Проверяем логи API
docker logs psychology-prod-api

# Перезапускаем Nginx
docker restart psychology-prod-nginx
```

### 9.4 Проблема: SSL сертификаты не работают

**Решение:**

```bash
# Проверяем сертификаты
ls -la /etc/letsencrypt/live/balance-space.ru/

# Проверяем символические ссылки
ls -la /var/www/psychology/nginx/ssl/

# Пересоздаем ссылки
sudo rm /var/www/psychology/nginx/ssl/*
sudo ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/
sudo ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/

# Перезапускаем Nginx
docker restart psychology-prod-nginx
```

### 9.5 Проблема: Миграции не применяются

**Решение:**

```bash
# Запускаем миграции вручную
docker compose -f docker-compose.prod.yml run --rm api \
  sh -c "cd /app && npx prisma migrate deploy"

# Проверяем статус миграций
docker compose -f docker-compose.prod.yml run --rm api \
  sh -c "cd /app && npx prisma migrate status"
```

### 9.6 Проблема: Не хватает места на диске

**Решение:**

```bash
# Проверяем использование диска
df -h

# Очищаем Docker
docker system prune -a --volumes -f

# Удаляем старые образы
docker image prune -a -f

# Удаляем старые бэкапы (старше 30 дней)
find /var/backups/psychology -name "*.gz" -mtime +30 -delete
```

---

## 10. Дополнительные настройки

### 10.1 Настройка автозапуска при перезагрузке

Docker контейнеры уже настроены на автозапуск (`restart: unless-stopped`), но убедитесь, что Docker запускается при старте системы:

```bash
sudo systemctl enable docker
```

### 10.2 Настройка логирования

Для централизованного логирования можно использовать ELK Stack или простое решение с rsyslog.

### 10.3 Настройка мониторинга

Для мониторинга можно использовать:
- **Portainer** - веб-интерфейс для управления Docker
- **Grafana + Prometheus** - мониторинг метрик
- **Uptime Kuma** - мониторинг доступности

---

## 11. Контакты и поддержка

При возникновении проблем:
1. Проверьте раздел [Troubleshooting](#9-troubleshooting)
2. Изучите логи контейнеров
3. Проверьте документацию проекта в `/docs`

---

## Чек-лист успешного деплоя

- [ ] Сервер подготовлен и настроен
- [ ] Docker установлен и работает
- [ ] DNS записи созданы и работают
- [ ] SSL сертификаты получены
- [ ] Проект склонирован
- [ ] Файл `.env.prod` настроен с безопасными паролями
- [ ] Деплой скрипт выполнен успешно
- [ ] Все контейнеры запущены
- [ ] API отвечает на запросы
- [ ] Сайт открывается в браузере
- [ ] Admin панель доступна
- [ ] Настроено автоматическое резервное копирование
- [ ] Проверены логи на наличие ошибок

**Поздравляем! 🎉 Ваше приложение успешно развернуто!**

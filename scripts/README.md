# Скрипты деплоя Psychology Platform

Этот каталог содержит скрипты для развертывания и управления приложением на production/dev серверах.

## Содержание

### 1. `setup-server.sh`
**Назначение**: Первоначальная настройка чистого Ubuntu 24.04 сервера

**Что делает**:
- Обновляет систему
- Создает пользователя `deploy`
- Настраивает файрвол (UFW)
- Устанавливает Docker и Docker Compose
- Устанавливает Certbot для SSL
- Создает необходимые директории
- Настраивает ротацию логов
- Настраивает swap (если нужно)
- Устанавливает инструменты мониторинга

**Использование**:
```bash
# На сервере от имени root
wget https://raw.githubusercontent.com/your-repo/psychology/develop/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

**Требования**: 
- Ubuntu 24.04
- Root доступ
- Подключение к интернету

---

### 2. `deploy.sh`
**Назначение**: Основной скрипт деплоя приложения

**Что делает**:
- Проверяет зависимости
- Проверяет файл окружения
- Создает резервную копию БД
- Обновляет код из Git
- Останавливает старые контейнеры
- Собирает новые Docker образы
- Применяет миграции БД
- Запускает контейнеры
- Проверяет здоровье сервисов
- Очищает старые образы

**Использование**:
```bash
# Полный деплой
./scripts/deploy.sh deploy

# Создание бэкапа
./scripts/deploy.sh backup

# Просмотр логов
./scripts/deploy.sh logs

# Перезапуск контейнеров
./scripts/deploy.sh restart

# Остановка контейнеров
./scripts/deploy.sh stop

# Статус контейнеров
./scripts/deploy.sh status
```

**Требования**:
- Сервер настроен через `setup-server.sh`
- Файл `.env.prod` настроен
- Docker запущен
- Git репозиторий склонирован

---

## Быстрый старт

### Шаг 1: Настройка сервера
```bash
# На сервере от root
./scripts/setup-server.sh
```

### Шаг 2: Настройка DNS
Создайте A-записи для домена:
- `@` → IP сервера
- `www` → IP сервера
- `admin` → IP сервера
- `api` → IP сервера

### Шаг 3: Получение SSL сертификатов
```bash
# От root
certbot certonly --standalone \
  -d balance-space.ru \
  -d www.balance-space.ru \
  -d admin.balance-space.ru \
  -d api.balance-space.ru \
  --email your-email@example.com \
  --agree-tos
```

### Шаг 4: Клонирование проекта
```bash
# От пользователя deploy
su - deploy
cd /var/www/psychology
git clone -b develop YOUR_REPO_URL .
```

### Шаг 5: Настройка окружения
```bash
cp env.prod.example .env.prod
nano .env.prod
# Заполните все переменные!
```

### Шаг 6: Создание символических ссылок для SSL
```bash
# От root
sudo mkdir -p /var/www/psychology/nginx/ssl
sudo ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/fullchain.pem
sudo ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/privkey.pem
```

### Шаг 7: Деплой
```bash
# От пользователя deploy
chmod +x /var/www/psychology/scripts/deploy.sh
./scripts/deploy.sh deploy
```

---

## Переменные окружения

Перед деплоем необходимо настроить файл `.env.prod`. Используйте `env.prod.example` как шаблон.

**Важные переменные**:
- `DB_PASSWORD` - пароль для PostgreSQL
- `REDIS_PASSWORD` - пароль для Redis
- `JWT_SECRET` - секрет для JWT токенов (64+ символов)
- `SESSION_SECRET` - секрет для сессий (64+ символов)

**Генерация безопасных значений**:
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

---

## Архитектура деплоя

```
┌─────────────────────────────────────────────┐
│              Nginx (Port 80, 443)           │
│         SSL Termination & Reverse Proxy     │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┴──────────┬──────────────┐
    │                    │              │
    ▼                    ▼              ▼
┌─────────┐      ┌─────────────┐   ┌─────────┐
│   Web   │      │     API     │   │  Admin  │
│ Next.js │      │   NestJS    │   │ Next.js │
│  :3000  │      │    :3000    │   │  :3001  │
└─────────┘      └──────┬──────┘   └─────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        ┌──────────┐        ┌─────────┐
        │PostgreSQL│        │  Redis  │
        │  :5432   │        │  :6379  │
        └──────────┘        └─────────┘
```

---

## Мониторинг и логи

### Просмотр логов всех сервисов
```bash
./scripts/deploy.sh logs
```

### Логи конкретного сервиса
```bash
docker logs psychology-prod-api
docker logs psychology-prod-web
docker logs psychology-prod-admin
docker logs psychology-prod-nginx
```

### Мониторинг ресурсов
```bash
docker stats
```

---

## Резервное копирование

### Автоматическое резервное копирование
Настройте cron для автоматических бэкапов:

```bash
crontab -e

# Добавьте:
0 3 * * * /var/www/psychology/scripts/deploy.sh backup >> /var/log/psychology-backup.log 2>&1
```

### Ручное резервное копирование
```bash
./scripts/deploy.sh backup
```

Бэкапы сохраняются в `/var/backups/psychology/` и автоматически удаляются после 7 дней.

---

## Обновление приложения

```bash
cd /var/www/psychology
./scripts/deploy.sh deploy
```

Скрипт автоматически:
1. Создаст бэкап БД
2. Обновит код из Git
3. Пересоберет образы
4. Применит миграции
5. Перезапустит сервисы

---

## Troubleshooting

### Контейнеры не запускаются
```bash
# Проверьте логи
docker compose -f docker compose.prod.yml logs

# Проверьте .env файл
cat .env.prod

# Перезапустите
docker compose -f docker compose.prod.yml down
docker compose -f docker compose.prod.yml up -d
```

### Ошибка подключения к БД
```bash
# Проверьте контейнер БД
docker logs psychology-prod-db

# Проверьте подключение
docker exec -it psychology-prod-db psql -U psychology_user -d psychology_prod
```

### 502 Bad Gateway
```bash
# Проверьте backend
docker logs psychology-prod-api

# Перезапустите nginx
docker restart psychology-prod-nginx
```

---

## Полезные ссылки

- [Полная инструкция по деплою](../docs/DEPLOYMENT.md)
- [Чеклист деплоя](../docs/DEPLOYMENT-CHECKLIST.md)
- [Быстрые команды](../docs/COMMANDS.md)

---

## Контакты

При возникновении проблем обращайтесь к DevOps команде или изучите документацию в `/docs`.

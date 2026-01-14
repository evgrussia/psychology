# Краткая сводка: Файлы для деплоя Dev Server

## ✅ Созданные файлы

### 1. Docker конфигурации
- **`apps/api/Dockerfile`** - Dockerfile для backend API (NestJS)
- **`apps/web/Dockerfile`** - Dockerfile для frontend (Next.js)
- **`apps/admin/Dockerfile`** - Dockerfile для admin панели (Next.js)
- **`docker-compose.prod.yml`** - Docker Compose для production окружения

### 2. Nginx конфигурация
- **`nginx/nginx.conf`** - Основная конфигурация Nginx
- **`nginx/conf.d/default.conf`** - Конфигурация виртуальных хостов для всех доменов
- **`nginx/README.md`** - Документация по Nginx

### 3. Скрипты деплоя
- **`scripts/setup-server.sh`** - Скрипт первоначальной настройки сервера
- **`scripts/deploy.sh`** - Основной скрипт деплоя
- **`scripts/README.md`** - Документация по скриптам

### 4. Конфигурация окружения
- **`env.prod.example`** - Шаблон файла окружения для production

### 5. Документация
- **`docs/DEPLOYMENT.md`** - Полная инструкция по деплою (11 разделов)
- **`docs/DEPLOYMENT-CHECKLIST.md`** - Чеклист для деплоя (23 пункта)
- **`docs/COMMANDS.md`** - Быстрые команды для управления сервером

### 6. Обновленные файлы
- **`apps/web/next.config.js`** - Добавлен `output: 'standalone'`
- **`apps/admin/next.config.js`** - Создан с `output: 'standalone'`
- **`.gitignore`** - Добавлены исключения для production файлов

---

## 🚀 Быстрый старт

### Шаг 1: Подготовка
```bash
# На сервере от root
ssh root@213.159.67.199

# Загрузите setup-server.sh
wget https://raw.githubusercontent.com/your-repo/psychology/develop/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

### Шаг 2: DNS
Создайте A-записи:
- `@` → `213.159.67.199`
- `www` → `213.159.67.199`
- `admin` → `213.159.67.199`
- `api` → `213.159.67.199`

### Шаг 3: SSL
```bash
certbot certonly --standalone \
  -d balance-space.ru \
  -d www.balance-space.ru \
  -d admin.balance-space.ru \
  -d api.balance-space.ru \
  --email your-email@example.com \
  --agree-tos
```

### Шаг 4: Проект
```bash
su - deploy
cd /var/www/psychology
git clone -b develop YOUR_REPO_URL .
cp env.prod.example .env.prod
nano .env.prod  # Заполните переменные!
```

### Шаг 5: SSL ссылки
```bash
# От root
sudo mkdir -p /var/www/psychology/nginx/ssl
sudo ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/fullchain.pem
sudo ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/privkey.pem
```

### Шаг 6: Деплой
```bash
# От deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy
```

---

## 📋 Что нужно сделать перед деплоем

### 1. Сгенерировать пароли и секреты
```bash
# PostgreSQL пароль
openssl rand -base64 32

# Redis пароль
openssl rand -base64 32

# JWT Secret
openssl rand -base64 64

# Session Secret
openssl rand -base64 64
```

### 2. Заполнить `.env.prod`
```bash
DB_USER=psychology_user
DB_PASSWORD=<your_generated_password>
DB_NAME=psychology_prod
REDIS_PASSWORD=<your_redis_password>
JWT_SECRET=<your_jwt_secret>
SESSION_SECRET=<your_session_secret>
API_URL=https://api.balance-space.ru
SITE_URL=https://balance-space.ru
ADMIN_URL=https://admin.balance-space.ru
NEXT_PUBLIC_API_URL=https://balance-space.ru/api
NEXT_PUBLIC_SITE_URL=https://balance-space.ru
NEXT_PUBLIC_ADMIN_URL=https://admin.balance-space.ru
```

### 3. Обновить URL репозитория
В файлах документации замените:
- `YOUR_GIT_REPO_URL` на фактический URL вашего репозитория
- `your-email@example.com` на ваш email

---

## 🏗️ Архитектура

```
Internet
    ↓
Nginx (Port 80/443)
    ├── balance-space.ru → Web (Next.js :3000)
    ├── admin.balance-space.ru → Admin (Next.js :3001)
    ├── api.balance-space.ru → API (NestJS :3000)
    └── /api → API (NestJS :3000)
         ↓
    PostgreSQL :5432
    Redis :6379
```

---

## 🔧 Управление сервером

### Основные команды
```bash
# Деплой
./scripts/deploy.sh deploy

# Логи
./scripts/deploy.sh logs

# Статус
./scripts/deploy.sh status

# Перезапуск
./scripts/deploy.sh restart

# Бэкап
./scripts/deploy.sh backup
```

### Проверка здоровья
```bash
# API
curl https://balance-space.ru/api/health

# Сайт
curl -I https://balance-space.ru

# Admin
curl -I https://admin.balance-space.ru
```

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| `docs/DEPLOYMENT.md` | Полная инструкция по деплою |
| `docs/DEPLOYMENT-CHECKLIST.md` | Чеклист для проверки |
| `docs/COMMANDS.md` | Быстрые команды |
| `scripts/README.md` | Документация по скриптам |
| `nginx/README.md` | Документация по Nginx |

---

## ⚠️ Важные замечания

### Безопасность
- ✅ Используйте сильные уникальные пароли
- ✅ Храните `.env.prod` в безопасном месте
- ✅ Не коммитьте `.env.prod` в Git
- ✅ Регулярно обновляйте систему и Docker

### Резервное копирование
- ✅ Настройте автоматические бэкапы через cron
- ✅ Регулярно проверяйте возможность восстановления
- ✅ Храните бэкапы в безопасном месте

### Мониторинг
- ✅ Регулярно проверяйте логи
- ✅ Мониторьте использование ресурсов
- ✅ Настройте алерты при проблемах

---

## 🆘 Troubleshooting

### Проблема: Контейнеры не запускаются
```bash
docker compose -f docker-compose.prod.yml logs
docker compose -f docker-compose.prod.yml ps
```

### Проблема: 502 Bad Gateway
```bash
docker logs psychology-prod-api
docker logs psychology-prod-nginx
docker restart psychology-prod-nginx
```

### Проблема: SSL не работает
```bash
sudo certbot certificates
ls -la /var/www/psychology/nginx/ssl/
docker restart psychology-prod-nginx
```

---

## ✅ Чеклист готовности

- [ ] Сервер настроен через `setup-server.sh`
- [ ] DNS записи созданы и работают
- [ ] SSL сертификаты получены
- [ ] Репозиторий склонирован
- [ ] `.env.prod` настроен
- [ ] SSL ссылки созданы
- [ ] Деплой выполнен успешно
- [ ] Все сервисы запущены
- [ ] API отвечает
- [ ] Сайт открывается
- [ ] Настроены бэкапы

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте чеклист выше
2. Изучите раздел Troubleshooting
3. Проверьте логи контейнеров
4. Обратитесь к полной документации

---

**Готово! Все необходимые файлы для деплоя созданы. 🎉**

Следуйте инструкциям в `docs/DEPLOYMENT.md` для выполнения деплоя.

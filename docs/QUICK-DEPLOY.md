# 🚀 Деплой на сервер - Краткая инструкция (одна страница)

**Сервер**: Ubuntu 24.04 | **IP**: 213.159.67.199 | **Домен**: balance-space.ru

---

## 📋 Предварительная подготовка

### 1. Сгенерируйте пароли локально:
```bash
openssl rand -base64 32  # DB password
openssl rand -base64 32  # Redis password
openssl rand -base64 64  # JWT secret
openssl rand -base64 64  # Session secret
```

### 2. Настройте DNS (в панели регистратора домена):
```
@ A 213.159.67.199
www A 213.159.67.199
admin A 213.159.67.199
api A 213.159.67.199
```

---

## 🛠️ На сервере (от root)

### Шаг 1: Настройка сервера
```bash
ssh root@213.159.67.199
cd ~
wget https://raw.githubusercontent.com/YOUR_REPO/psychology/main/scripts/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

### Шаг 2: Получение SSL
```bash
certbot certonly --standalone \
  -d balance-space.ru -d www.balance-space.ru \
  -d admin.balance-space.ru -d api.balance-space.ru \
  --email your@email.com --agree-tos
```

### Шаг 3: Переключение на deploy
```bash
su - deploy
cd /var/www/psychology
```

### Шаг 4: Клонирование проекта
```bash
git clone -b main https://github.com/YOUR_REPO/psychology.git .
```

### Шаг 5: Настройка окружения
```bash
cp env.prod.example .env.prod
nano .env.prod
```

**Вставьте в .env.prod:**
```env
NODE_ENV=production
DB_USER=psychology_user
DB_PASSWORD=<paste_db_password>
DB_NAME=psychology_prod
REDIS_PASSWORD=<paste_redis_password>
JWT_SECRET=<paste_jwt_secret>
SESSION_SECRET=<paste_session_secret>
API_URL=https://api.balance-space.ru
SITE_URL=https://balance-space.ru
ADMIN_URL=https://admin.balance-space.ru
NEXT_PUBLIC_API_URL=https://balance-space.ru/api
NEXT_PUBLIC_SITE_URL=https://balance-space.ru
NEXT_PUBLIC_ADMIN_URL=https://admin.balance-space.ru
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 6: SSL ссылки (переключиться на root)
```bash
exit  # Выход из deploy
sudo mkdir -p /var/www/psychology/nginx/ssl
sudo ln -s /etc/letsencrypt/live/balance-space.ru/fullchain.pem /var/www/psychology/nginx/ssl/fullchain.pem
sudo ln -s /etc/letsencrypt/live/balance-space.ru/privkey.pem /var/www/psychology/nginx/ssl/privkey.pem
su - deploy  # Обратно в deploy
```

### Шаг 7: ДЕПЛОЙ! 🚀
```bash
cd /var/www/psychology
chmod +x scripts/*.sh
./scripts/deploy.sh deploy
```

**Ждите 10-15 минут...**

### Шаг 8: Seed (наполнение базы контентом) — первый запуск

Чтобы сайт/админка/интерактивы работали с реальными данными, выполните seed **один раз** после первого деплоя.

```bash
cd /var/www/psychology
docker compose -f docker-compose.prod.yml run --rm api \
  sh -c "cd /app && npx -y ts-node --transpile-only prisma/seed.ts"
```

Примечание: для seed должны быть заданы `ENCRYPTION_KEY_ID` и `ENCRYPTION_KEY` в `.env.prod`.

---

## ✅ Проверка

### Проверьте контейнеры:
```bash
docker ps
```

Должно быть 6 контейнеров: db, redis, api, web, admin, nginx

### Проверьте работу:
```bash
curl https://balance-space.ru/api/health
# Должен вернуть: {"status":"ok"}
```

### Откройте в браузере:
- https://balance-space.ru
- https://admin.balance-space.ru
- https://balance-space.ru/api/docs

---

## 🔧 Полезные команды

```bash
# Логи
./scripts/deploy.sh logs

# Статус
./scripts/deploy.sh status

# Перезапуск
./scripts/deploy.sh restart

# Мониторинг
./scripts/monitor.sh

# Бэкап
./scripts/deploy.sh backup
```

---

## 🆘 Проблемы?

### Контейнеры не запускаются:
```bash
docker logs psychology-prod-api
docker logs psychology-prod-nginx
```

### 502 Bad Gateway:
```bash
docker restart psychology-prod-nginx
docker logs psychology-prod-api
```

### SSL не работает:
```bash
ls -la /etc/letsencrypt/live/balance-space.ru/
ls -la /var/www/psychology/nginx/ssl/
sudo certbot certificates
```

---

## 📚 Полная документация

- **Подробная инструкция**: `docs/DEPLOYMENT.md`
- **Чеклист**: `docs/DEPLOYMENT-CHECKLIST.md`
- **Команды**: `docs/COMMANDS.md`

---

## 🎉 Готово!

После успешного деплоя:
1. ✅ Все контейнеры запущены
2. ✅ API отвечает на /api/health
3. ✅ Сайт открывается через HTTPS
4. ✅ SSL сертификаты валидны

**Настройте автоматические бэкапы:**
```bash
crontab -e
# Добавьте: 0 3 * * * /var/www/psychology/scripts/deploy.sh backup
```

---

**Время деплоя**: ~30 минут | **Сложность**: средняя | **Автоматизация**: высокая

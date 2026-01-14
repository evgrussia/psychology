# Быстрые команды для управления Dev сервером

## Основные команды деплоя

### Полный деплой
```bash
cd /var/www/psychology
./scripts/deploy.sh deploy
```

### Просмотр логов
```bash
./scripts/deploy.sh logs
```

### Проверка статуса
```bash
./scripts/deploy.sh status
```

### Перезапуск сервисов
```bash
./scripts/deploy.sh restart
```

### Создание бэкапа
```bash
./scripts/deploy.sh backup
```

## Docker команды

### Просмотр запущенных контейнеров
```bash
docker ps
```

### Просмотр всех контейнеров
```bash
docker ps -a
```

### Логи конкретного сервиса
```bash
docker logs psychology-prod-api
docker logs psychology-prod-web
docker logs psychology-prod-admin
docker logs psychology-prod-nginx
docker logs psychology-prod-db
docker logs psychology-prod-redis
```

### Следить за логами в реальном времени
```bash
docker logs -f psychology-prod-api
```

### Войти в контейнер
```bash
docker exec -it psychology-prod-api sh
docker exec -it psychology-prod-web sh
docker exec -it psychology-prod-db psql -U psychology_user -d psychology_prod
```

### Перезапуск отдельного контейнера
```bash
docker restart psychology-prod-api
docker restart psychology-prod-web
docker restart psychology-prod-nginx
```

## База данных

### Подключение к PostgreSQL
```bash
docker exec -it psychology-prod-db psql -U psychology_user -d psychology_prod
```

### Резервная копия базы данных
```bash
docker exec psychology-prod-db pg_dump -U psychology_user psychology_prod > backup_$(date +%Y%m%d).sql
```

### Восстановление базы данных
```bash
cat backup_20260114.sql | docker exec -i psychology-prod-db psql -U psychology_user -d psychology_prod
```

### Применение миграций
```bash
cd /var/www/psychology
docker compose -f docker-compose.prod.yml run --rm api sh -c "cd /app && npx prisma migrate deploy"
```

### Проверка статуса миграций
```bash
docker compose -f docker-compose.prod.yml run --rm api sh -c "cd /app && npx prisma migrate status"
```

### Генерация Prisma клиента
```bash
docker compose -f docker-compose.prod.yml run --rm api sh -c "cd /app && npx prisma generate"
```

### Открыть Prisma Studio
```bash
docker compose -f docker-compose.prod.yml run --rm -p 5555:5555 api sh -c "cd /app && npx prisma studio"
# Откройте http://your-server-ip:5555
```

## Обновление приложения

### Обновить код из Git и передеплоить
```bash
cd /var/www/psychology
git pull origin main
./scripts/deploy.sh deploy
```

### Быстрое обновление без пересборки
```bash
cd /var/www/psychology
git pull origin main
docker compose -f docker-compose.prod.yml restart
```

## Мониторинг

### Использование ресурсов
```bash
docker stats
```

### Использование диска
```bash
df -h
docker system df
```

### Свободная память
```bash
free -h
```

### Процессы на сервере
```bash
htop
```

### Порты
```bash
netstat -tulpn | grep LISTEN
```

## Очистка

### Очистка неиспользуемых Docker ресурсов
```bash
docker system prune -a -f
```

### Очистка томов
```bash
docker volume prune -f
```

### Очистка логов Nginx
```bash
cd /var/www/psychology/nginx/logs
rm -f *.log
```

## Nginx

### Проверка конфигурации Nginx
```bash
docker exec psychology-prod-nginx nginx -t
```

### Перезагрузка конфигурации Nginx
```bash
docker exec psychology-prod-nginx nginx -s reload
```

### Просмотр access логов
```bash
docker exec psychology-prod-nginx tail -f /var/log/nginx/access.log
```

### Просмотр error логов
```bash
docker exec psychology-prod-nginx tail -f /var/log/nginx/error.log
```

## SSL сертификаты

### Проверка срока действия сертификата
```bash
sudo certbot certificates
```

### Обновление сертификатов
```bash
sudo certbot renew
docker restart psychology-prod-nginx
```

### Тест обновления сертификатов
```bash
sudo certbot renew --dry-run
```

## Тестирование

### Проверка здоровья API
```bash
curl http://localhost/api/health
curl https://balance-space.ru/api/health
```

### Проверка версии API
```bash
curl http://localhost/api/version
```

### Проверка основного сайта
```bash
curl -I https://balance-space.ru
```

### Проверка admin панели
```bash
curl -I https://admin.balance-space.ru
```

### Тест производительности
```bash
ab -n 100 -c 10 https://balance-space.ru/
```

## Экстренные ситуации

### Полная остановка всех сервисов
```bash
cd /var/www/psychology
docker compose -f docker-compose.prod.yml down
```

### Полный перезапуск с очисткой
```bash
cd /var/www/psychology
docker compose -f docker-compose.prod.yml down -v
./scripts/deploy.sh deploy
```

### Откат к предыдущей версии
```bash
cd /var/www/psychology
git log --oneline  # Найдите нужный коммит
git checkout <commit-hash>
./scripts/deploy.sh deploy
```

### Восстановление из бэкапа
```bash
# Посмотреть доступные бэкапы
ls -lah /var/backups/psychology/

# Восстановить БД
gunzip < /var/backups/psychology/db_backup_20260114_030000.sql.gz | \
  docker exec -i psychology-prod-db psql -U psychology_user -d psychology_prod
```

## Полезные алиасы

Добавьте в `~/.bashrc` для удобства:

```bash
# Alias для деплоя
alias psy-deploy='cd /var/www/psychology && ./scripts/deploy.sh deploy'
alias psy-logs='cd /var/www/psychology && ./scripts/deploy.sh logs'
alias psy-status='cd /var/www/psychology && ./scripts/deploy.sh status'
alias psy-restart='cd /var/www/psychology && ./scripts/deploy.sh restart'
alias psy-backup='cd /var/www/psychology && ./scripts/deploy.sh backup'

# Перезагрузите shell
source ~/.bashrc
```

После этого можно использовать короткие команды:
- `psy-deploy` - деплой
- `psy-logs` - логи
- `psy-status` - статус
- `psy-restart` - перезапуск
- `psy-backup` - бэкап

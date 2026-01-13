# Платформа «Эмоциональный баланс»

Этот репозиторий является монорепозиторием для платформы «Эмоциональный баланс».

## Структура репозитория

- `apps/api` - Backend API (NestJS, Clean Architecture)
- `apps/web` - Клиентское веб-приложение (Next.js)
- `apps/admin` - Панель администратора (Next.js)
- `apps/bot` - Telegram бот (TypeScript, Telegraf)
- `packages/` - Общие пакеты и библиотеки
- `docs/` - Документация проекта

## Быстрый старт

### Требования
- Node.js (v18+)
- pnpm (v8+)
- Docker и Docker Compose

### Установка зависимостей
```bash
pnpm install
```

### Запуск инфраструктуры
```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379

### Настройка окружения
Скопируйте `.env.example` в `.env` и заполните необходимые переменные:
```bash
cp .env.example .env
```

Обязательные переменные для API:
- `NODE_ENV` - окружение (development/production/test)
- `PORT` - порт API сервера (по умолчанию 3000)
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT токенов

Опциональные переменные:
- `HTTP_TIMEOUT_MS` - таймаут HTTP запросов (по умолчанию 30000)
- `HTTP_RETRY_ATTEMPTS` - количество попыток повтора (по умолчанию 3)

### Инициализация базы данных
```bash
cd apps/api
pnpm prisma:generate
pnpm migrate:dev
```

### Запуск в режиме разработки
```bash
pnpm dev
```

Это запустит все сервисы параллельно:
- API на http://localhost:3000
- Web на http://localhost:3000 (если настроен)
- Admin на http://localhost:3001
- Bot (Telegram)

## Стандарты разработки
- **Backend:** Соблюдение принципов Clean Architecture и DDD.
- **Frontend:** Компонентный подход, Next.js App Router.
- **CI/CD:** GitHub Actions для проверок на PR и деплоя.

## Команды

### Общие команды
- `pnpm build` - Сборка всех приложений
- `pnpm lint` - Проверка линтером
- `pnpm test` - Запуск тестов
- `pnpm typecheck` - Проверка типов TypeScript
- `pnpm dev` - Запуск всех сервисов в режиме разработки

### Команды для API
```bash
cd apps/api
```

- `pnpm dev` - Запуск API в режиме разработки
- `pnpm build` - Сборка API
- `pnpm test` - Запуск unit тестов
- `pnpm test:watch` - Запуск тестов в watch режиме
- `pnpm test:cov` - Запуск тестов с покрытием
- `pnpm migrate:dev` - Создание новой миграции (development)
- `pnpm migrate:deploy` - Применение миграций (production)
- `pnpm migrate:status` - Проверка статуса миграций
- `pnpm prisma:generate` - Генерация Prisma Client
- `pnpm prisma:studio` - Открыть Prisma Studio (GUI для БД)

## Тестирование

### Unit тесты
```bash
cd apps/api
pnpm test
```

### Integration тесты
```bash
cd apps/api
pnpm test test/app.e2e-spec.ts
```

### Покрытие кода
```bash
cd apps/api
pnpm test:cov
```

## CI/CD

### CI (Continuous Integration)
Автоматически запускается на каждый PR и push в main/develop:
- Линтинг
- Проверка типов
- Тесты
- Сборка
- Security checks (secret scanning, dependency audit)

### CD (Continuous Deployment)

**Stage окружение:**
- Автоматический деплой при push в `develop`
- Применение миграций
- Healthchecks после деплоя

**Production окружение:**
- Деплой при создании тега `v*`
- Требует подтверждения через workflow_dispatch
- Применение миграций с проверкой
- Rollback при ошибках

## Архитектура

Проект следует принципам **Clean Architecture** и **Domain-Driven Design (DDD)**:

- **Domain Layer** (`apps/api/src/domain/`) - бизнес-логика, не зависит от фреймворков
- **Application Layer** (`apps/api/src/application/`) - use cases и оркестрация
- **Infrastructure Layer** (`apps/api/src/infrastructure/`) - реализации репозиториев, интеграции
- **Presentation Layer** (`apps/api/src/presentation/`) - контроллеры, API endpoints

Подробнее см. `docs/Архитектурный-обзор.md` и `docs/generated/tech-specs/FEAT-PLT-01.md`.

## Healthchecks

API предоставляет следующие endpoints:

- `GET /api/health` - базовая проверка работоспособности
- `GET /api/ready` - проверка готовности (включая подключение к БД)
- `GET /api/version` - информация о версии и commit SHA

## Документация API

После запуска API, Swagger документация доступна по адресу:
http://localhost:3000/api/docs

# Руководство по работе с миграциями базы данных

**Проект:** «Эмоциональный баланс»  
**Версия:** 1.0  
**Дата:** 2026-01-13

---

## Содержание

1. [Обзор](#обзор)
2. [Локальная разработка](#локальная-разработка)
3. [CI/CD](#cicd)
4. [Production](#production)
5. [Rollback процедура](#rollback-процедура)
6. [Best practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Обзор

Проект использует **Prisma** для управления миграциями PostgreSQL. Все миграции хранятся в `apps/api/prisma/migrations/` и применяются автоматически в CI/CD или вручную в локальной среде.

### Структура миграций

```
apps/api/prisma/
├── schema.prisma          # Prisma схема (источник истины)
├── migrations/            # Применённые миграции
│   ├── 20260113110201_init_release_1/
│   ├── 20260113110522_add_performance_indexes/
│   └── 20260113120000_add_indexes_and_constraints/
└── seed.ts                # Seed данные
```

### Команды Prisma

| Команда | Описание |
|---------|----------|
| `pnpm migrate:dev` | Создать и применить миграцию (development) |
| `pnpm migrate:deploy` | Применить все pending миграции (production) |
| `pnpm migrate:status` | Проверить статус миграций |
| `pnpm migrate:rollback` | Откатить последнюю миграцию |
| `pnpm prisma:generate` | Сгенерировать Prisma Client |
| `pnpm prisma:studio` | Открыть Prisma Studio (GUI) |

---

## Локальная разработка

### Первоначальная настройка

1. **Запустить PostgreSQL через Docker Compose:**
   ```bash
   docker-compose up -d db
   ```

2. **Настроить переменные окружения:**
   ```bash
   # .env файл в apps/api/
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/psychology"
   ```

3. **Применить миграции:**
   ```bash
   cd apps/api
   pnpm migrate:deploy
   ```

4. **Загрузить seed данные:**
   ```bash
   pnpm prisma db seed
   ```

### Создание новой миграции

1. **Изменить `schema.prisma`:**
   - Добавить/изменить модели, поля, индексы
   - Сохранить файл

2. **Создать миграцию:**
   ```bash
   pnpm migrate:dev --name descriptive_migration_name
   ```
   
   Prisma:
   - Сгенерирует SQL миграцию
   - Применит её к БД
   - Обновит `_prisma_migrations` таблицу

3. **Проверить сгенерированный SQL:**
   - Открыть `prisma/migrations/YYYYMMDDHHMMSS_migration_name/migration.sql`
   - Убедиться, что SQL корректен

4. **При необходимости добавить ручные правки:**
   - Для CHECK constraints, триггеров, функций используйте raw SQL
   - Добавьте комментарии с rollback notes для критичных изменений

### Пример: Добавление нового поля

```prisma
// schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String?  @unique
  phone     String?  @unique
  new_field String?  // Новое поле
}
```

```bash
pnpm migrate:dev --name add_new_field_to_user
```

### Проверка статуса миграций

```bash
pnpm migrate:status
```

Вывод покажет:
- ✅ Applied migrations
- ⏳ Pending migrations
- ❌ Failed migrations

---

## CI/CD

### Stage environment

Миграции применяются автоматически при деплое в stage (ветка `develop`):

```yaml
# .github/workflows/deploy-stage.yml
- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.STAGE_DATABASE_URL }}
  run: |
    cd apps/api
    pnpm migrate:deploy
```

**Важно:**
- Миграции применяются **до** деплоя приложения
- При ошибке миграции деплой отменяется
- Все миграции должны быть идемпотентными

### Production environment

Миграции применяются при деплое в production (тег `v*` или manual trigger):

```yaml
# .github/workflows/deploy-prod.yml
- name: Run database migrations (dry-run first)
  env:
    DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
  run: |
    cd apps/api
    pnpm migrate:status  # Проверка перед применением

- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
  run: |
    cd apps/api
    pnpm migrate:deploy
```

**Важно:**
- Всегда проверяйте `migrate:status` перед применением
- Критичные миграции требуют ручного review
- Используйте feature flags для постепенного rollout

---

## Production

### Подготовка к миграции

1. **Проверить pending миграции:**
   ```bash
   pnpm migrate:status
   ```

2. **Просмотреть SQL миграций:**
   - Открыть файлы в `prisma/migrations/`
   - Убедиться, что нет destructive операций без процедуры

3. **Создать backup БД:**
   ```bash
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

### Применение миграций

**Вариант 1: Автоматически (через CI/CD)**
- Миграции применяются автоматически при деплое
- См. раздел [CI/CD](#cicd)

**Вариант 2: Вручную**
```bash
export DATABASE_URL="postgresql://user:pass@host:5432/db"
cd apps/api
pnpm migrate:deploy
```

### Мониторинг

После применения миграций проверьте:

1. **Статус миграций:**
   ```bash
   pnpm migrate:status
   ```

2. **Здоровье приложения:**
   ```bash
   curl https://api.example.com/api/health
   curl https://api.example.com/api/ready
   ```

3. **Логи приложения:**
   - Проверьте отсутствие ошибок подключения к БД
   - Убедитесь, что все запросы работают

---

## Rollback процедура

### Когда нужен rollback

- Миграция привела к ошибкам в production
- Обнаружена критичная проблема после применения
- Требуется откатить изменения для hotfix

### Процедура rollback

**⚠️ Внимание:** Prisma не поддерживает автоматический rollback. Используйте ручной подход:

#### Шаг 1: Остановить приложение

```bash
# Остановить API сервер
systemctl stop psychology-api
```

#### Шаг 2: Откатить миграцию в БД

**Вариант A: Если миграция только что применена**

```bash
# Пометить миграцию как откаченную
pnpm migrate:rollback --applied <migration_name>
```

**Вариант B: Ручной SQL rollback**

1. Откройте файл миграции: `prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql`
2. Создайте обратный SQL (см. примеры ниже)
3. Примените вручную:

```sql
-- Пример rollback для добавления колонки
ALTER TABLE "users" DROP COLUMN IF EXISTS "new_field";

-- Пример rollback для индекса
DROP INDEX IF EXISTS "appointments_start_at_utc_idx";

-- Пример rollback для CHECK constraint
ALTER TABLE "curated_items" DROP CONSTRAINT IF EXISTS "curated_items_xor_check";
```

#### Шаг 3: Восстановить из backup (если нужно)

```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_YYYYMMDD_HHMMSS.sql
```

#### Шаг 4: Проверить состояние

```bash
pnpm migrate:status
```

#### Шаг 5: Запустить приложение

```bash
systemctl start psychology-api
```

### Примеры rollback SQL

#### Добавление колонки → Удаление
```sql
-- Migration
ALTER TABLE "users" ADD COLUMN "new_field" TEXT;

-- Rollback
ALTER TABLE "users" DROP COLUMN "new_field";
```

#### Создание индекса → Удаление
```sql
-- Migration
CREATE INDEX "appointments_start_at_utc_idx" ON "appointments"("start_at_utc");

-- Rollback
DROP INDEX IF EXISTS "appointments_start_at_utc_idx";
```

#### Изменение типа колонки → Откат типа
```sql
-- Migration
ALTER TABLE "anonymous_questions" 
  ALTER COLUMN "trigger_flags" TYPE JSONB USING "trigger_flags"::JSONB;

-- Rollback (если нужно вернуть TEXT)
ALTER TABLE "anonymous_questions" 
  ALTER COLUMN "trigger_flags" TYPE TEXT USING "trigger_flags"::TEXT;
```

---

## Best practices

### 1. Именование миграций

Используйте описательные имена:

```bash
# ✅ Хорошо
pnpm migrate:dev --name add_user_phone_verification
pnpm migrate:dev --name add_indexes_for_booking_conflicts
pnpm migrate:dev --name fix_trigger_flags_type

# ❌ Плохо
pnpm migrate:dev --name migration1
pnpm migrate:dev --name fix
```

### 2. Идемпотентность

Все миграции должны быть идемпотентными:

```sql
-- ✅ Хорошо: используйте IF NOT EXISTS / IF EXISTS
CREATE INDEX IF NOT EXISTS "appointments_start_at_utc_idx" ON "appointments"("start_at_utc");
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "new_field" TEXT;

-- ❌ Плохо: без проверок
CREATE INDEX "appointments_start_at_utc_idx" ON "appointments"("start_at_utc");
```

### 3. Destructive операции

Для удаления колонок/таблиц используйте двухшаговую процедуру:

**Шаг 1:** Добавить новую колонку, backfill данные
```sql
ALTER TABLE "users" ADD COLUMN "new_field" TEXT;
UPDATE "users" SET "new_field" = "old_field" WHERE "old_field" IS NOT NULL;
```

**Шаг 2:** (В следующей миграции) Переключить приложение, затем удалить старую
```sql
-- После переключения приложения на новое поле
ALTER TABLE "users" DROP COLUMN "old_field";
```

### 4. Большие миграции

Для больших изменений (миллионы записей):

1. Разбейте на несколько миграций
2. Используйте `LIMIT` и батчинг для backfill
3. Добавьте мониторинг прогресса

```sql
-- Пример батчинга
DO $$
DECLARE
  batch_size INT := 1000;
  affected INT;
BEGIN
  LOOP
    UPDATE "users" 
    SET "new_field" = "old_field" 
    WHERE "new_field" IS NULL 
    LIMIT batch_size;
    
    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;
    
    COMMIT;
  END LOOP;
END $$;
```

### 5. Комментарии и rollback notes

Добавляйте комментарии в миграции:

```sql
-- Migration: Add indexes for booking conflict checking
-- Date: 2026-01-13
-- Purpose: Improve performance of appointment conflict queries
-- 
-- Rollback note: 
--   DROP INDEX IF EXISTS "appointments_start_at_utc_idx";
--   DROP INDEX IF EXISTS "appointments_status_idx";
```

### 6. Тестирование миграций

Перед применением в production:

1. Протестируйте на локальной БД
2. Протестируйте на stage
3. Проверьте интеграционные тесты: `pnpm test:e2e`

---

## Тестирование миграций

Для безопасной проверки миграций перед деплоем используйте изолированную тестовую среду:

1. **Поднять тестовую БД:**
   ```bash
   pnpm test:infra:up
   ```

2. **Применить миграции к тестовой БД:**
   Тесты автоматически выполняют миграции перед запуском. Вы также можете запустить их вручную:
   ```bash
   # Используя test.env
   export DATABASE_URL="postgresql://test_user:test_password@localhost:5433/psychology_test?schema=public"
   cd apps/api
   pnpm migrate:deploy
   ```

3. **Запустить тесты целостности БД:**
   ```bash
   pnpm test:api:e2e test/smoke.e2e-spec.ts
   ```

---

## Troubleshooting

### Проблема: Миграция не применяется

**Симптомы:**
```
Error: Migration failed to apply
```

**Решение:**
1. Проверьте подключение к БД: `DATABASE_URL`
2. Проверьте права пользователя БД
3. Убедитесь, что нет конфликтующих изменений в БД
4. Проверьте логи: `pnpm migrate:status`

### Проблема: "Migration already applied"

**Симптомы:**
```
Error: Migration X already applied
```

**Решение:**
```bash
# Проверить статус
pnpm migrate:status

# Если миграция действительно применена, это нормально
# Если нет - пометить как resolved:
pnpm migrate:resolve --applied <migration_name>
```

### Проблема: Конфликт схемы

**Симптомы:**
```
Error: Schema drift detected
```

**Решение:**
1. Синхронизируйте `schema.prisma` с текущей БД:
   ```bash
   pnpm prisma db pull
   ```
2. Или примените миграции:
   ```bash
   pnpm migrate:deploy
   ```

### Проблема: Миграция зависла

**Симптомы:**
- Миграция выполняется долго
- БД заблокирована

**Решение:**
1. Проверьте активные транзакции:
   ```sql
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```
2. Если нужно, завершите зависшую транзакцию:
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE ...;
   ```
3. Откатите миграцию (см. [Rollback процедура](#rollback-процедура))

---

## Дополнительные ресурсы

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FEAT-PLT-02 Tech Spec](../generated/tech-specs/FEAT-PLT-02.md)

---

**Последнее обновление:** 2026-01-13

# Техническая спецификация: доработка EPIC-00 (Platform & Foundations)

**Проект:** «Эмоциональный баланс»  
**Версия спеки:** v0.1 (draft)  
**Автор:** Cursor Agent  
**Дата:** 2026-01-19  
**Статус:** draft  

**Epic:** `EPIC-00`  
**Приоритет:** P0  
**Трекер:** TBD  

---

## 1) Summary (коротко)

### 1.1 Что делаем
Закрываем незавершенные пункты EPIC-00:
- создаем и фиксируем базовые миграции Prisma для полной схемы Release 1;
- добавляем CI/CD workflows (GitHub Actions) согласно требованиям `FEAT-PLT-01`.

### 1.2 Почему сейчас
- **Сигнал/боль:** миграции отсутствуют, CI/CD конфигурации в репозитории нет.
- **Ожидаемый эффект:** воспроизводимые деплои, валидация PR, отсутствие ручных действий.
- **Если не сделать:** риск расхождения схемы БД, нестабильные релизы, отсутствие контроля качества.

### 1.3 Ссылки на первоисточники
- `docs/generated/tech-specs/FEAT-PLT-01.md`
- `docs/generated/tech-specs/FEAT-PLT-02.md`
- `docs/DEPLOYMENT.md`

---

## 2) Goals / Non-goals

### 2.1 Goals
- **G1:** В репозитории есть миграции Prisma для полной схемы Release 1.
- **G2:** CI workflow запускает lint/typecheck/tests/build и падает при ошибке.
- **G3:** В CI есть минимальные security checks (secret scan, dependency audit).
- **G4:** CD workflows для stage/prod соответствуют требованиям FEAT-PLT-01.

### 2.2 Non-goals
- **NG1:** Перепроектирование схемы БД или доменной модели.
- **NG2:** Замена провайдера CI/CD (только GitHub Actions).
- **NG3:** Полноценный SRE-стек мониторинга (это FEAT-AN-03).

---

## 3) Scope (границы и сценарии)

### 3.1 In-scope
- **US-1:** Разработчик применяет миграции на чистой БД без ручных правок.
- **US-2:** PR автоматически проверяется CI (линт/типы/тесты/сборка).
- **US-3:** Stage деплой проходит с миграциями и healthcheck.

### 3.2 Out-of-scope
- Миграции данных от предыдущих версий (считаем чистый старт).
- CI/CD для альтернативных VCS или self-hosted CI.

### 3.3 Acceptance criteria
- [ ] В `apps/api/prisma/migrations/` есть миграции (не только `.gitkeep`).
- [ ] `pnpm --filter @psychology/api migrate:deploy` успешно применяет миграции.
- [ ] CI workflow запускается на PR и содержит lint/typecheck/tests/build.
- [ ] Security checks включают secret scan и dependency audit.
- [ ] CD workflows: stage на `develop`, prod на теги `v*` + manual approval.

### 3.4 Негативные сценарии
- **NS-1:** Ошибка миграции → деплой прерывается, сервис не переходит в unhealthy state.
- **NS-2:** Отсутствует обязательная переменная окружения → CI/CD падает с понятной ошибкой.

---

## 4) Архитектура и ответственность слоёв

### 4.1 Компоненты/модули
- **Infrastructure:** `apps/api/prisma/migrations/*`
- **CI/CD:** `.github/workflows/ci.yml`, `.github/workflows/cd-stage.yml`, `.github/workflows/cd-prod.yml`
- **Scripts:** `scripts/deploy.sh`, `docker-compose.prod.yml`

### 4.2 Основные сценарии
- `CI`: install → lint → typecheck → test → build → security checks.
- `CD stage`: build & deploy → migrate → healthcheck.
- `CD prod`: manual approval → deploy → migrate → healthcheck → rollback on failure.

---

## 5) Модель данных и миграции

### 5.1 Миграции
- **Инициализация:** создать базовую миграцию из `apps/api/prisma/schema.prisma`.
- **Именование:** `0001_init_release1` или аналогичный порядок.
- **Контроль:** в репозиторий коммитится SQL миграции и `migration_lock.toml`.

### 5.2 Rollback
- Для начальной миграции rollback не требуется (начинаем с чистой БД).
- Для будущих миграций: add → backfill → switch → drop (см. FEAT-PLT-02).

---

## 6) CI/CD

### 6.1 CI workflow
Рекомендуемая структура:
- `actions/setup-node` + `pnpm/action-setup`
- cache pnpm store
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (или ограничить на unit + api e2e при доступности Docker)
- `pnpm build`
- Security:
  - dependency audit (`pnpm audit --prod`)
  - secret scan (gitleaks/secretlint или GitHub Advanced Security если доступно)

### 6.2 CD Stage
- Триггер: push в `develop`.
- Шаги:
  - build images
  - deploy via `scripts/deploy.sh`
  - `pnpm --filter @psychology/api migrate:deploy`
  - healthcheck `/api/ready`

### 6.3 CD Prod
- Триггер: tag `v*` + manual approval.
- Шаги аналогичны stage, с rollback при ошибке миграции или healthcheck.

---

## 7) Test plan

### 7.1 Unit tests
- Ничего нового, используется существующий `pnpm test`.

### 7.2 Integration tests
- Прогон миграций на чистой БД (`migrate:deploy`).
- Smoke `/api/health` и `/api/ready`.

### 7.3 E2E
- Не требуется для этой доработки.

---

## 8) Open questions

- Нужен ли nightly workflow для полного набора e2e (web + api)?
- Какой инструмент secret scan выбираем (gitleaks vs secretlint vs GitHub встроенный)?


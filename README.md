# Cursor Agent System

**Мультиагентная система для полного цикла разработки веб-приложений в Cursor IDE**

---

## Обзор

Cursor Agent System — это модульная система виртуальных агентов, которая помогает вести проект от идеи до продакшна. Система реализована как набор спецификаций и правил для работы в Cursor IDE, где AI-ассистент может "переключаться" между ролями специалистов.

### Ключевые возможности

- **19 специализированных агентов** — от Product Manager до Business Analyst
- **6 переиспользуемых навыков** — генерация документации, исследования, верификация
- **Автоматическое управление контекстом** — экономия токенов через summaries и checkpoints
- **Структурированный workflow** — фазы, quality gates, handoff между агентами
- **Команды чата** — быстрый доступ к функциям системы

---

## Архитектура системы

```
┌─────────────────────────────────────────────────────────────────┐
│                         ПОЛЬЗОВАТЕЛЬ                             │
│                    (команды в чате Cursor)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ПРАВИЛА (Rules)                             │
│  00-agentic-system-core.mdc  │  01-agent-routing-and-formats.mdc │
│                02-context-and-checkpoints.mdc                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR AGENT                           │
│            Координация, декомпозиция, quality gates              │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   DISCOVERY   │   │    DESIGN     │   │ ARCHITECTURE  │
│ product       │   │ ux            │   │ architect     │
│ research      │   │ ui            │   │ data          │
│ analytics     │   │ content       │   │ security      │
│ business-     │   │               │   │               │
│ analyst       │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DEVELOPMENT                                │
│            dev → ai-agents → coder → review → qa                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT                                  │
│                    devops → sre                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MARKETING                                  │
│                       marketing                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Структура файлов

```
.cursor/
├── rules/                          # Автоматически применяемые правила
│   ├── 00-agentic-system-core.mdc      # Базовые принципы системы
│   ├── 01-agent-routing-and-formats.mdc # Роутинг и форматы handoff
│   └── 02-context-and-checkpoints.mdc   # Управление контекстом
│
├── agents/                         # Спецификации агентов (19 шт.)
│   ├── INDEX.md                        # Реестр агентов
│   ├── orchestrator.md                 # Координатор проекта
│   ├── product.md                      # Product Manager
│   ├── research.md                     # Market Researcher
│   ├── analytics.md                    # Analytics Engineer
│   ├── business-analyst.md             # Business Analyst
│   ├── ux.md                           # UX Designer
│   ├── ui.md                           # UI Designer
│   ├── content.md                      # Content Strategist
│   ├── architect.md                    # Software Architect
│   ├── data.md                         # Data Engineer
│   ├── security.md                     # Security Engineer
│   ├── dev.md                          # Tech Lead
│   ├── ai-agents.md                    # AI/ML Engineer
│   ├── coder.md                        # Full-Stack Developer
│   ├── qa.md                           # QA Engineer
│   ├── review.md                       # Code Reviewer
│   ├── devops.md                       # DevOps Engineer
│   ├── sre.md                          # Site Reliability Engineer
│   └── marketing.md                    # Marketing Manager
│
├── skills/                         # Переиспользуемые навыки (6 шт.)
│   ├── INDEX.md                        # Реестр навыков
│   ├── context-manager/SKILL.md        # Управление контекстом
│   ├── document-generator/SKILL.md     # Генерация документации
│   ├── image-generator/SKILL.md        # Генерация графики
│   ├── verification-engine/SKILL.md    # Верификация реализации
│   ├── web-research/SKILL.md           # Веб-исследования
│   └── langchain-development/SKILL.md  # AI-агенты на LangChain
│
└── commands/                       # Справка по командам
    ├── INDEX.md
    ├── start-project.md
    ├── status.md
    ├── route.md
    ├── checkpoint.md
    └── summary.md
```

---

## Агенты

### Реестр агентов по фазам

| Фаза | Агенты | Основные артефакты |
|------|--------|-------------------|
| **Discovery** | `product`, `research`, `analytics`, `business-analyst` | Vision, PRD, User Stories, Market Research, Metrics, Business Model, Capabilities |
| **Design** | `ux`, `ui`, `content` | User Flows, Wireframes, Design System, UI Copy |
| **Architecture** | `architect`, `data`, `security` | System Design, ADRs, DB Schema, API Contracts, Threat Model |
| **Development** | `dev`, `ai-agents`, `coder` | Tech Specs, AI Agents, Code Implementation |
| **QA** | `qa`, `review` | Test Strategy, Test Cases, Code Review, Verification |
| **Deployment** | `devops`, `sre` | CI/CD, IaC, Monitoring, Runbooks |
| **Marketing** | `marketing` | Launch Plan, Content Plan, Channel Strategy |

### Полное описание всех агентов (19 шт.)

---

#### 1. Orchestrator (Координатор)

**Роль:** Lead Project Manager / Technical Program Manager

**Обязанности:**
- Приём и анализ бизнес-идеи
- Декомпозиция на задачи для субагентов
- Маршрутизация задач к соответствующим агентам
- Управление quality gates между фазами
- Создание checkpoints и summaries
- Разрешение конфликтов между агентами

**Артефакты:**
- `context/project-brief.yaml`
- `context/checkpoints/CP-*.yaml`
- `context/summaries/*.yaml`

**Пример использования:**
```
/start-project Сервис онлайн-бронирования для салонов красоты
```
```
/status
```
```
/checkpoint
```

---

#### 2. Product Agent

**Роль:** Senior Product Manager (7+ лет опыта)

**Обязанности:**
- Vision Document — стратегическое видение продукта
- PRD — детальные требования к продукту
- User Stories — пользовательские сценарии с Acceptance Criteria
- Roadmap — план развития продукта
- Decision Log — лог ключевых продуктовых решений

**Артефакты:**
- `docs/discovery/vision.md`
- `docs/discovery/prd.md`
- `docs/discovery/user-stories.md`
- `docs/discovery/roadmap.md`
- `docs/discovery/decision-log.md`

**Пример использования:**
```
/route product создай Vision Document для marketplace фриланс-услуг
```
```
/route product напиши PRD для MVP с фокусом на core features
```
```
/route product создай User Stories для функции поиска и фильтрации
```

---

#### 3. Research Agent

**Роль:** Senior Market Research Analyst

**Обязанности:**
- Competitive Analysis — анализ конкурентов (3-5 прямых, 2-3 косвенных)
- Market Research — размер рынка (TAM/SAM/SOM), тренды
- User Research Synthesis — pain points, unmet needs, JTBD
- Technology Research — best practices, open-source решения

**Артефакты:**
- `docs/research/competitive-analysis.md`
- `docs/research/market-research.md`
- `docs/research/user-research.md`
- `docs/research/technology-research.md`

**Пример использования:**
```
/route research проведи анализ конкурентов для сервиса доставки еды
```
```
/route research исследуй рынок EdTech в России и СНГ
```
```
/route research найди best practices для реализации real-time чата
```

---

#### 4. Analytics Agent

**Роль:** Senior Analytics Engineer / Data Analyst

**Обязанности:**
- Metrics Framework — North Star Metric, AARRR фреймворк
- Tracking Plan — события, параметры, naming conventions
- A/B Experiment Framework — гипотезы, метрики, sample size
- Dashboard Specifications — требования к дашбордам

**Артефакты:**
- `docs/analytics/metrics-framework.md`
- `docs/analytics/tracking-plan.md`
- `docs/analytics/experiment-framework.md`

**Пример использования:**
```
/route analytics создай metrics framework с North Star Metric
```
```
/route analytics разработай tracking plan для воронки регистрации
```
```
/route analytics спланируй A/B тест для новой формы онбординга
```

---

#### 5. Business Analyst Agent

**Роль:** Senior Business Analyst / Enterprise Architect (10+ лет опыта)

**Обязанности:**
- Digital Transformation Strategy — стратегия цифровой трансформации (AS-IS/TO-BE)
- Business Model — бизнес-модель компании (Business Model Canvas)
- Capability Mapping — карты бизнес-возможностей (L1-L3)
- Value Streams — потоки создания ценности
- IT Landscape — IT-ландшафт и интеграции приложений
- Stakeholder Analysis — матрица стейкхолдеров
- Requirements (FURPS+) — функциональные и нефункциональные требования
- Use Cases — пользовательские сценарии и потоки вариантов использования
- Business Processes — описание бизнес-процессов (BPMN)

**Frameworks и методологии:**
- TOGAF (The Open Group Architecture Framework)
- SAFe (Scaled Agile Framework)
- ArchiMate, BPMN 2.0, UML

**Артефакты:**
- `docs/business/digital-transformation-strategy.md`
- `docs/business/business-model.md`
- `docs/business/capability-map-current.md`
- `docs/business/capability-map-target.md`
- `docs/business/value-streams.md`
- `docs/business/it-landscape-map.md`
- `docs/business/application-integration-diagram.md`
- `docs/business/stakeholder-matrix.md`
- `docs/business/requirements-furps.md`
- `docs/business/use-cases.md`
- `docs/business/user-scenarios.md`
- `docs/business/processes/*.md`

**Пример использования:**
```
/route business-analyst создай стратегию цифровой трансформации для компании X
```
```
/route business-analyst разработай бизнес-модель для нового продукта Y
```
```
/route business-analyst проведи анализ бизнес-возможностей и создай capability map
```
```
/route business-analyst задокументируй IT-ландшафт и интеграции систем
```
```
/route business-analyst создай матрицу стейкхолдеров для проекта Z
```
```
/route business-analyst опиши требования по модели FURPS+
```
```
/route business-analyst задокументируй бизнес-процесс обработки заказов
```

---

#### 6. UX Agent

**Роль:** Senior UX Designer / UX Lead

**Обязанности:**
- User Flows — потоки пользователей (happy path, альтернативные, error states)
- Customer Journey Maps — карты путешествия клиента
- Information Architecture — структура сайта, навигация
- Wireframes — черновые макеты экранов
- Accessibility Requirements — требования доступности (WCAG)

**Артефакты:**
- `docs/design/user-flows.md`
- `docs/design/cjm.md`
- `docs/design/information-architecture.md`
- `docs/design/wireframes.md`
- `docs/design/accessibility.md`

**Пример использования:**
```
/route ux создай user flow для процесса оформления заказа
```
```
/route ux разработай information architecture для e-commerce сайта
```
```
/route ux определи требования accessibility по WCAG 2.1 AA
```

---

#### 7. UI Agent

**Роль:** Senior UI Designer / Design System Lead

**Обязанности:**
- Design Tokens — цвета, типографика, spacing, shadows
- Component Library — Atoms, Molecules, Organisms, Templates
- Visual Style Guide — визуальный стайлгайд
- Asset Requirements — требования к изображениям и иконкам

**Артефакты:**
- `docs/design/design-tokens.md`
- `docs/design/component-library.md`
- `docs/design/visual-specs.md`
- `docs/design/asset-requirements.md`

**Пример использования:**
```
/route ui создай design tokens для SaaS-приложения в стиле минимализм
```
```
/route ui разработай component library с Button, Input, Card, Modal
```
```
/route ui подготовь asset requirements для hero-изображений и иллюстраций
```

---

#### 8. Content Agent

**Роль:** Senior UX Writer / Content Strategist

**Обязанности:**
- Voice & Tone Guide — голос и тон бренда
- UX Copy — тексты интерфейса для всех экранов
- Microcopy Guide — паттерны для кнопок, форм, ошибок, tooltips
- Email Templates — шаблоны транзакционных и маркетинговых писем

**Артефакты:**
- `docs/content/voice-and-tone.md`
- `docs/content/content-strategy.md`
- `docs/content/ui-copy.md`
- `docs/content/microcopy-guide.md`

**Пример использования:**
```
/route content создай Voice & Tone guide для финтех-стартапа
```
```
/route content напиши UI copy для экранов регистрации и онбординга
```
```
/route content разработай microcopy guide для validation messages
```

---

#### 9. Architect Agent

**Роль:** Lead Software Architect (10+ лет опыта)

**Обязанности:**
- System Architecture — высокоуровневая архитектура (Monolith/Microservices)
- C4 Diagrams — Context, Container, Component диаграммы
- ADRs — Architecture Decision Records
- NFR Specifications — нефункциональные требования
- Technology Stack — выбор технологий с обоснованием

**Артефакты:**
- `docs/architecture/overview.md`
- `docs/architecture/c4-diagrams.md`
- `docs/architecture/adrs/`
- `docs/architecture/nfr-specs.md`
- `docs/architecture/tech-stack.md`

**Пример использования:**
```
/route architect спроектируй архитектуру для маркетплейса с 10K DAU
```
```
/route architect выбери tech stack для React + Node.js + PostgreSQL
```
```
/route architect создай ADR для выбора между REST и GraphQL
```

---

#### 10. Data Agent

**Роль:** Senior Data Engineer / Database Architect

**Обязанности:**
- Domain Model — модель данных по DDD (Aggregates, Entities, Value Objects)
- Database Schema — ER диаграммы, таблицы, индексы, constraints
- API Contracts — OpenAPI spec, endpoints, request/response schemas
- Migrations Strategy — план миграций БД

**Артефакты:**
- `docs/data/domain-model.md`
- `docs/data/database-schema.md`
- `docs/data/api-contracts.md`
- `api/openapi.yaml`
- `docs/data/migrations.md`

**Пример использования:**
```
/route data создай domain model для системы управления задачами
```
```
/route data спроектируй database schema для PostgreSQL
```
```
/route data разработай API contracts в формате OpenAPI 3.0
```

---

#### 11. Security Agent

**Роль:** Senior Security Engineer / AppSec Specialist

**Обязанности:**
- Threat Model — модель угроз по STRIDE
- Security Requirements — требования к auth, authz, encryption
- Security Policies — политики паролей, сессий, доступа
- Compliance Requirements — GDPR, CCPA, SOC 2

**Артефакты:**
- `docs/security/threat-model.md`
- `docs/security/security-requirements.md`
- `docs/security/policies.md`
- `docs/security/compliance.md`

**Пример использования:**
```
/route security проведи threat modeling по STRIDE для платёжного модуля
```
```
/route security определи security requirements для JWT + MFA
```
```
/route security создай checklist для GDPR compliance
```

---

#### 12. Dev Agent

**Роль:** Tech Lead / Senior Full-Stack Developer

**Обязанности:**
- Technical Specifications — детальные техспеки для каждой фичи
- Code Conventions — стандарты кодирования, naming, структура
- Project Setup — настройка репозитория, линтеры, CI/CD
- Координация Coder Agent — передача задач, review результатов

**Артефакты:**
- `docs/development/project-setup.md`
- `docs/development/code-conventions.md`
- `docs/development/specs/*.md`

**Пример использования:**
```
/route dev создай technical spec для функции уведомлений
```
```
/route dev разработай code conventions для TypeScript проекта
```
```
/route dev настрой project setup с ESLint, Prettier, Husky
```

---

#### 13. AI-Agents Agent

**Роль:** Senior AI/ML Engineer (3+ года в AI/ML)

**Обязанности:**
- Agent Architecture Design — паттерны (ReAct, Supervisor, Handoff)
- Tool Design & Implementation — инструменты для агентов
- Memory & State Management — short-term, long-term, checkpointing
- Multi-Agent Orchestration — координация нескольких агентов
- Production Deployment — LangSmith, мониторинг, scaling

**Артефакты:**
- `docs/ai-agents/requirements/*.md`
- `docs/ai-agents/architecture/*.md`
- `src/agents/*/`

**Пример использования:**
```
/route ai-agents спроектируй архитектуру customer support агента
```
```
/route ai-agents создай tools для работы с базой данных и API
```
```
/route ai-agents разработай memory system с vector store
```

---

#### 14. Coder Agent

**Роль:** Senior Full-Stack Developer

**Обязанности:**
- Code Implementation — реализация кода по техническим спецификациям
- Test Writing — unit tests, integration tests
- Bug Fixing — исправление багов по замечаниям Review Agent
- Refactoring — улучшение качества кода

**Артефакты:**
- Код в `src/`
- Тесты в `tests/`
- Миграции в `prisma/migrations/`

**Пример использования:**
```
/route coder реализуй CRUD для сущности User по спецификации
```
```
/route coder напиши unit тесты для AuthService
```
```
/route coder исправь баги из review: C-001, C-002, C-003
```

---

#### 15. QA Agent

**Роль:** Senior QA Engineer / SDET

**Обязанности:**
- Test Strategy — стратегия тестирования (pyramid, types, tools)
- Test Plan — план тестирования для релиза
- Test Cases — тест-кейсы для каждой фичи
- Test Infrastructure — Docker setup, fixtures, CI integration
- Test Execution — запуск тестов, анализ результатов

**Артефакты:**
- `docs/testing/test-strategy.md`
- `docs/testing/test-plan.md`
- `docs/testing/test-cases/*.md`
- `docker/docker-compose.test.yml`

**Пример использования:**
```
/route qa создай test strategy для веб-приложения
```
```
/route qa разработай test cases для функции checkout
```
```
/route qa настрой test infrastructure с Docker и GitHub Actions
```

---

#### 16. Review Agent

**Роль:** Senior Code Reviewer / Technical Reviewer

**Обязанности:**
- Implementation Verification — проверка реализации на 100% соответствие спеке
- Code Quality Review — качество кода, naming, architecture
- Test Coverage Review — проверка покрытия тестами
- Security Review — базовая проверка безопасности

**Артефакты:**
- Verification Report с процентом реализации
- Список findings (Critical, High, Medium, Low)

**Пример использования:**
```
/route review проверь реализацию AuthModule на соответствие спецификации
```
```
/route review сделай code review для PR #42
```
```
/route review проведи security review для модуля платежей
```

---

#### 17. DevOps Agent

**Роль:** Senior DevOps Engineer / Platform Engineer

**Обязанности:**
- CI/CD Pipeline — GitHub Actions / GitLab CI для build/test/deploy
- Infrastructure as Code — Terraform / Pulumi конфигурации
- Deployment Strategy — Blue/Green, Canary, Rolling
- Container Configuration — Dockerfiles, docker-compose, K8s

**Артефакты:**
- `.github/workflows/*.yml`
- `infrastructure/terraform/`
- `docker/Dockerfile.*`
- `docker/docker-compose.yml`
- `docs/operations/deployment.md`

**Пример использования:**
```
/route devops создай CI/CD pipeline для GitHub Actions
```
```
/route devops напиши Terraform конфигурацию для AWS (ECS + RDS + Redis)
```
```
/route devops настрой Docker multi-stage build для production
```

---

#### 18. SRE Agent

**Роль:** Senior Site Reliability Engineer

**Обязанности:**
- SLO/SLI Definition — цели надёжности (99.9% availability, <500ms latency)
- Monitoring Setup — метрики, логи, трейсинг
- Alerting Configuration — алерты, escalation policy, on-call
- Runbooks — операционные процедуры для incident response

**Артефакты:**
- `docs/operations/slo.md`
- `docs/operations/monitoring.md`
- `docs/operations/alerting.md`
- `docs/operations/runbooks/*.md`

**Пример использования:**
```
/route sre определи SLO/SLI для API сервиса
```
```
/route sre настрой monitoring с Prometheus + Grafana
```
```
/route sre создай runbook для alert "High Error Rate"
```

---

#### 19. Marketing Agent

**Роль:** Senior Marketing Manager / Growth Strategist

**Обязанности:**
- Marketing Strategy — позиционирование, messaging, USP
- Launch Plan — pre-launch, launch day, post-launch activities
- Channel Strategy — organic (SEO, content), paid (ads), email
- Content Plan — контент-календарь, форматы, repurposing

**Артефакты:**
- `docs/marketing/strategy.md`
- `docs/marketing/launch-plan.md`
- `docs/marketing/channel-strategy.md`
- `docs/marketing/content-plan.md`

**Пример использования:**
```
/route marketing создай marketing strategy для B2B SaaS
```
```
/route marketing разработай launch plan для Product Hunt запуска
```
```
/route marketing составь content plan на 3 месяца
```

---

## Навыки (Skills)

Навыки — переиспользуемые способности, доступные нескольким агентам.

| Навык | Назначение | Используется агентами |
|-------|------------|----------------------|
| `context-manager` | Summaries, checkpoints, token budget | orchestrator, все |
| `document-generator` | README, API docs, User guides | dev, coder, architect |
| `image-generator` | Иллюстрации, иконки, hero images | ui, marketing |
| `verification-engine` | Проверка соответствия спекам | review, qa |
| `web-research` | Market research, Competitive analysis | research, product |
| `langchain-development` | Паттерны AI-агентов, код LangChain | ai-agents, coder |

---

## Команды чата

Система использует префиксы в сообщениях для быстрого доступа к функциям.

| Команда | Назначение | Результат |
|---------|------------|-----------|
| `/start-project <идея>` | Начать новый проект | `context/project-brief.yaml`, Discovery plan |
| `/status` | Текущее состояние | Фаза, checkpoint, next actions, blockers |
| `/route <agent> <task>` | Выполнить в роли агента | task_response с артефактами |
| `/checkpoint` | Сохранить срез | `context/checkpoints/CP-*.yaml` |
| `/summary` | Сжать состояние | Outcomes, decisions, artifacts, next actions |

### Примеры использования

```
/start-project SaaS для управления подписками на курсы
```

```
/route product создай PRD для MVP
```

```
/route architect выбери tech stack для React + Node.js приложения
```

```
/status
```

```
/checkpoint
```

---

## Workflow проекта

### Фаза 1: Intake (Orchestrator)
1. Получить идею от заказчика
2. Создать Project Brief
3. Определить scope и constraints
4. Инициализировать Context Store

### Фаза 2: Discovery
1. **Product Agent** → Vision, PRD, User Stories
2. **Research Agent** → Competitive Analysis, Market Research
3. **Analytics Agent** → Tracking Plan, Metrics Framework
4. Quality Gate: все Discovery документы готовы?

### Фаза 3: Design
1. **UX Agent** → User Flows, IA, Wireframes
2. **UI Agent** → Design System, UI Kit
3. **Content Agent** → UX Copy, Microcopy Guide
4. Quality Gate: дизайн-система готова?

### Фаза 4: Architecture
1. **Architect Agent** → System Design, ADRs, Tech Stack
2. **Data Agent** → Domain Model, DB Schema, API Contracts
3. **Security Agent** → Threat Model, Security Requirements
4. Quality Gate: архитектура утверждена?

### Фаза 5: Development
```
FOR EACH feature in Backlog:
  1. Dev Agent → Technical Spec
  2. Coder Agent → Implementation
  3. Review Agent → Verification
  4. IF < 100%: return to Coder Agent
  5. IF = 100%: QA Agent → Tests
  6. IF tests fail: Coder Agent fixes
```

### Фаза 6: Quality Assurance
1. **QA Agent** → Full regression, Acceptance criteria
2. **Security Agent** → Security review
3. Quality Gate: все тесты проходят?

### Фаза 7: Deployment
1. **DevOps Agent** → CI/CD, IaC, Deployments
2. **SRE Agent** → Monitoring, Alerts, Runbooks
3. Quality Gate: ready for production?

### Фаза 8: Marketing
1. **Marketing Agent** → Strategy, Launch Plan, Content Plan

---

## Управление контекстом

### Принцип иерархической компрессии

Информация хранится на разных уровнях детализации:

| Level | Тип | Размер | Когда использовать |
|-------|-----|--------|-------------------|
| 0 | Project Brief | ~100 tokens | Всегда в контексте |
| 1 | Phase Summary | ~500 tokens | Передача между фазами |
| 2 | Document Summary | ~200 tokens | Референс к документу |
| 3 | Full Document | 2000-5000 tokens | По запросу |

### Token Budget

```yaml
budget:
  current_task: 40%      # Текущая задача
  relevant_summaries: 30% # Релевантные саммари
  shared_context: 20%     # Общий контекст проекта
  history: 10%            # История решений
```

### Checkpoint Structure

```yaml
checkpoint:
  id: "CP-{phase}-{timestamp}"
  phase: string
  status: "completed" | "in_progress" | "blocked"
  summary: string (max 500 tokens)
  documents:
    - path: string
      status: string
  decisions:
    - id: string
      decision: string
      rationale: string
  next_actions:
    - action: string
      agent: string
      priority: number
  blockers: []
```

---

## Форматы взаимодействия

### Task Request (Orchestrator → Agent)

```yaml
task_request:
  agent: "<agent>"
  type: "create|review|update|verify"
  input:
    summary: "<кратко>"
    references:
      - "<path или ссылка>"
    constraints: []
  expected_output:
    deliverables:
      - "<что создать/обновить>"
```

### Task Response (Agent → Orchestrator)

```yaml
task_response:
  agent: "<agent>"
  status: "completed|partial|blocked|failed"
  output:
    summary: "<кратко>"
    artifacts:
      - "<path>"
    issues: []
    next_steps: []
```

---

## Quality Gates

### Discovery Gate
- [ ] Vision Document approved
- [ ] PRD complete with all sections
- [ ] User Stories with acceptance criteria
- [ ] Research findings documented

### Design Gate
- [ ] User Flows cover all scenarios
- [ ] Wireframes for all screens
- [ ] Design System documented
- [ ] Content ready for all states

### Architecture Gate
- [ ] System architecture documented
- [ ] All ADRs recorded
- [ ] Data model complete
- [ ] API contracts defined
- [ ] Security requirements addressed

### Development Gate
- [ ] All features implemented
- [ ] Code review passed (100%)
- [ ] Unit tests > 80% coverage
- [ ] Integration tests passing

### Release Gate
- [ ] All tests green
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Runbooks ready
- [ ] Rollback plan defined

---

## Расширение системы

### Добавление нового агента

1. Создать файл `.cursor/agents/<agent-name>.md` по шаблону:

```markdown
---
name: <agent-name>
description: <краткое описание для Task tool>
---

## Роль
<описание роли и уровня>

## Основные обязанности
1. ...

## Workflow
...

## Артефакты
- ...

## Quality Criteria
...

## Как использовать в Cursor
- `/route <agent-name> <задача>`
```

2. Обновить `.cursor/agents/INDEX.md`
3. Обновить секцию в `orchestrator.md`
4. (Опционально) обновить `.cursor/rules/01-agent-routing-and-formats.mdc`

### Добавление нового навыка

1. Создать директорию `.cursor/skills/<skill-name>/`
2. Создать файл `SKILL.md` по шаблону:

```markdown
---
name: <skill-name>
description: <описание>
---

# <Skill Name>

## Назначение
<что делает навык>

## Когда применять
- ...

## Входные данные
- ...

## Выходные данные
- ...

## Алгоритм / Шаблоны
...
```

3. Обновить `.cursor/skills/INDEX.md`
4. Обновить секцию в `orchestrator.md`

---

## Файловая структура проекта

При ведении проекта "по системе" используются следующие пути:

```
context/
├── project-brief.yaml          # Краткое описание проекта
├── summaries/                  # Саммари по фазам/документам
│   ├── discovery.yaml
│   ├── design.yaml
│   └── ...
├── checkpoints/                # Чекпоинты
│   ├── CP-discovery-2024-01-15.yaml
│   └── ...
└── archive/                    # Архив полных документов

docs/
├── discovery/
│   ├── vision.md
│   ├── prd.md
│   ├── user-stories.md
│   └── ...
├── research/
│   ├── competitive-analysis.md
│   ├── market-research.md
│   └── ...
├── business/
│   ├── digital-transformation-strategy.md
│   ├── business-model.md
│   ├── capability-map-current.md
│   ├── capability-map-target.md
│   ├── value-streams.md
│   ├── it-landscape-map.md
│   ├── application-integration-diagram.md
│   ├── stakeholder-matrix.md
│   ├── requirements-furps.md
│   ├── use-cases.md
│   ├── user-scenarios.md
│   └── processes/
├── design/
│   ├── user-flows.md
│   ├── design-tokens.md
│   └── ...
├── architecture/
│   ├── overview.md
│   ├── tech-stack.md
│   ├── adrs/
│   └── ...
├── data/
│   ├── domain-model.md
│   ├── api-contracts.md
│   └── ...
├── security/
│   ├── threat-model.md
│   └── ...
├── development/
│   ├── code-conventions.md
│   ├── specs/
│   └── ...
├── testing/
│   ├── test-strategy.md
│   └── ...
├── operations/
│   ├── deployment.md
│   ├── runbooks/
│   └── ...
└── marketing/
    ├── strategy.md
    ├── launch-plan.md
    └── ...
```

---

## Принципы работы

### 1. Язык
Система отвечает на **русском языке** (настраивается в rules).

### 2. Роль по умолчанию
Если роль не указана — работает как **Orchestrator**.

### 3. Источник истины
При сомнениях система опирается на спецификации в `.cursor/agents/*.md` и `.cursor/skills/*/SKILL.md`.

### 4. Контекст-экономия
Предпочитает summaries + ссылки на документы; полные документы загружает только по необходимости.

### 5. Качество
Для code/tasks использует цикл "реализация → review → фиксы → повтор" до **100% соответствия спецификации**.

---

## Быстрый старт

### 1. Начать новый проект

```
/start-project Мобильное приложение для трекинга привычек
```

### 2. Пройти Discovery

```
/route product создай Vision и PRD
/route research проведи competitive analysis
/route analytics создай metrics framework
```

### 3. Проверить статус

```
/status
```

### 4. Создать checkpoint

```
/checkpoint
```

### 5. Перейти к Design

```
/route ux создай user flows для основных сценариев
/route ui создай design tokens и component library
```

---

## Лицензия

MIT

---

## Ссылки

- [LangChain Documentation](https://python.langchain.com/docs/)
- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [Cursor IDE](https://cursor.sh/)

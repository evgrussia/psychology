---
name: devops
description: Sets up CI/CD pipelines, creates infrastructure as code, manages deployments, configures environments, and implements infrastructure practices. Use when setting up CI/CD, creating infrastructure, managing deployments, or configuring environments.
---

## Спецификация

# DevOps Agent

## Роль
Senior DevOps Engineer / Platform Engineer. Отвечает за инфраструктуру, CI/CD, и подготовку к production.

## Зона ответственности

1. **CI/CD Pipeline** - настройка пайплайнов
2. **Infrastructure as Code** - IaC конфигурации
3. **Deployment Strategy** - стратегия деплоя
4. **Environment Configuration** - настройка окружений
5. **Container Configuration** - Docker/Kubernetes

## Workflow

### Step 1: CI/CD Pipeline
```
INPUT: Tech Stack + Repository Structure

PROCESS:
1. Настроить build pipeline
2. Настроить test pipeline
3. Настроить deploy pipeline
4. Настроить security scanning
5. Настроить notifications

OUTPUT: .github/workflows/ или CI config
```

### Step 2: Infrastructure as Code
```
INPUT: Architecture + NFRs

PROCESS:
1. Выбрать IaC tool (Terraform/Pulumi)
2. Определить environments
3. Создать модули для:
   - Compute (EC2/Cloud Run/etc.)
   - Database (RDS/Cloud SQL)
   - Cache (ElastiCache/Redis)
   - Storage (S3/GCS)
   - Network (VPC, Security Groups)
4. Настроить state management

OUTPUT: /infrastructure/terraform/
```

### Step 3: Deployment Documentation
```
INPUT: Architecture + IaC

PROCESS:
1. Документировать environments
2. Описать deployment process
3. Создать rollback procedures
4. Настроить health checks

OUTPUT: /docs/operations/deployment.md
```

## Document Templates

### CI/CD Pipeline Template (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        run: |
          # Deploy script here
          echo "Deploying to staging..."
      - name: Run smoke tests
        run: npm run test:smoke

  deploy-production:
    if: github.event.inputs.environment == 'production'
    needs: [deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: |
          # Deploy script here
          echo "Deploying to production..."
```

### Terraform Template
```hcl
# infrastructure/terraform/main.tf

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "terraform-state-[project]"
    key    = "state/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Variables
variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (staging/production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Modules
module "vpc" {
  source = "./modules/vpc"
  
  project_name = var.project_name
  environment  = var.environment
}

module "database" {
  source = "./modules/database"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
}

module "app" {
  source = "./modules/app"
  
  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  database_url   = module.database.connection_string
}

# Outputs
output "app_url" {
  value = module.app.url
}

output "database_endpoint" {
  value     = module.database.endpoint
  sensitive = true
}
```

### Docker Configuration Template
```dockerfile
# docker/Dockerfile.api
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
    ports:
      - "80:80"
    depends_on:
      - api

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Deployment Documentation Template
```markdown
# Deployment Guide: [Product Name]

## Environments

| Environment | URL | Purpose | Auto-deploy |
|-------------|-----|---------|-------------|
| Development | localhost:3000 | Local dev | No |
| Staging | staging.example.com | Testing | Yes (main) |
| Production | app.example.com | Live | Manual |

## Prerequisites

- AWS CLI configured
- Terraform >= 1.5
- Docker
- kubectl (if K8s)

## Deployment Process

### Staging (Automatic)
```
Push to main → CI runs → Tests pass → Auto-deploy to staging
```

### Production (Manual)
1. Create release tag: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. Go to GitHub Actions
4. Run "Deploy" workflow
5. Select "production" environment
6. Approve deployment

## Rollback Procedure

### Immediate Rollback
```bash
# Option 1: Revert to previous deployment
kubectl rollout undo deployment/api

# Option 2: Deploy specific version
kubectl set image deployment/api api=image:v1.0.0
```

### Database Rollback
```bash
# Run reverse migration
npm run migrate:down
```

## Health Checks

| Endpoint | Expected | Timeout |
|----------|----------|---------|
| /health | 200 OK | 3s |
| /health/db | 200 OK | 5s |
| /health/redis | 200 OK | 3s |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | DB connection string | Yes |
| REDIS_URL | Redis connection | Yes |
| JWT_SECRET | JWT signing key | Yes |
| NODE_ENV | Environment | Yes |

## Secrets Management

Secrets are stored in AWS Secrets Manager:
- `[project]/[env]/database`
- `[project]/[env]/api-keys`

## Monitoring

- **APM:** Datadog / New Relic
- **Logs:** CloudWatch
- **Alerts:** PagerDuty
```

## Output Summary Format

```yaml
devops_summary:
  ci_cd:
    provider: "GitHub Actions"
    pipelines: ["ci", "deploy", "security"]
    environments: ["staging", "production"]
  
  infrastructure:
    provider: "AWS"
    iac_tool: "Terraform"
    services: ["ECS", "RDS", "ElastiCache", "S3"]
  
  containers:
    registry: "ECR"
    services: ["api", "web", "worker"]
  
  deployment:
    strategy: "Blue/Green"
    auto_deploy_staging: true
    manual_production: true
  
  documents_created:
    - path: "/.github/workflows/ci.yml"
      status: "complete"
    - path: "/.github/workflows/deploy.yml"
      status: "complete"
    - path: "/infrastructure/terraform/"
      status: "complete"
    - path: "/docker/"
      status: "complete"
    - path: "/docs/operations/deployment.md"
      status: "complete"
```

## Как использовать в Cursor

- `/route devops <задача>` — когда нужно настроить CI/CD, деплой, IaC, окружения.


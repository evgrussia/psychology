---
name: qa
description: Creates test strategies, test plans, test cases, sets up test infrastructure, runs test suites, and manages quality gates. Use when creating test strategies, writing test plans, setting up test infrastructure, or running quality assurance checks.
---

## Спецификация

# QA Agent

## Роль
Senior QA Engineer / SDET (Software Development Engineer in Test). Отвечает за стратегию тестирования и качество продукта.

## Зона ответственности

1. **Test Strategy** - стратегия тестирования
2. **Test Plan** - план тестирования
3. **Test Cases** - тест-кейсы
4. **Test Infrastructure** - тестовая инфраструктура
5. **Test Execution** - выполнение тестов
6. **Quality Gates** - критерии качества

## Принципы тестирования

### Testing Pyramid
```
        /\
       /  \     E2E Tests (10%)
      /----\    
     /      \   Integration Tests (20%)
    /--------\  
   /          \ Unit Tests (70%)
  /__________\
```

### Test Types by Layer
| Layer | Type | Purpose | Tools |
|-------|------|---------|-------|
| Unit | Frontend | Component logic | Jest, Vitest |
| Unit | Backend | Business logic | Jest, Pytest |
| Integration | API | Endpoint behavior | Supertest, Pytest |
| Integration | DB | Data operations | Testcontainers |
| E2E | UI | User flows | Playwright, Cypress |
| E2E | API | Full flow | Postman, Newman |

## Workflow

### Step 1: Test Strategy
```
INPUT: PRD + Architecture + Tech Stack

PROCESS:
1. Define testing scope
2. Choose test types for each layer
3. Define coverage requirements
4. Select testing tools
5. Plan test environments
6. Define quality gates

OUTPUT: /docs/testing/test-strategy.md
```

### Step 2: Test Plan
```
INPUT: User Stories + Technical Specs

PROCESS:
1. Map stories to test scenarios
2. Identify test data requirements
3. Define test phases
4. Estimate effort
5. Assign responsibilities
6. Create test schedule

OUTPUT: /docs/testing/test-plan.md
```

### Step 3: Test Cases
```
INPUT: Acceptance Criteria + Technical Specs

PROCESS:
For each feature:
1. Positive test cases
2. Negative test cases
3. Edge cases
4. Performance scenarios (if needed)
5. Security scenarios (if needed)

OUTPUT: /docs/testing/test-cases/[feature].md
```

### Step 4: Test Infrastructure
```
INPUT: Tech Stack + Test Strategy

PROCESS:
1. Docker setup for test DBs
2. Test user/fixtures creation
3. Test data seeding scripts
4. CI/CD integration
5. Parallel execution setup

OUTPUT: docker/docker-compose.test.yml
        scripts/test-setup.sh
        tests/fixtures/
```

### Step 5: Test Execution
```
INPUT: Implemented Feature + Test Cases

PROCESS:
1. Run unit tests
2. Run integration tests (sequential)
3. Run E2E tests
4. Generate coverage report
5. Document results
6. Report failures

OUTPUT: Test results + Coverage report
```

## Document Templates

### Test Strategy Template
```markdown
# Test Strategy: [Product Name]

## Overview
This document outlines the testing strategy for [Product Name].

## Scope

### In Scope
- Frontend application (React)
- Backend API (Node.js)
- Database operations
- Third-party integrations
- Security testing

### Out of Scope
- Load testing (separate effort)
- Penetration testing (external vendor)

## Test Levels

### Level 1: Unit Tests
**Scope:** Individual functions, components, classes
**Responsibility:** Developers
**Coverage Target:** 80%

**Frontend:**
- React component rendering
- Custom hooks logic
- Utility functions
- State management

**Backend:**
- Use cases
- Domain entities
- Validators
- Utilities

### Level 2: Integration Tests
**Scope:** Module interactions, API endpoints
**Responsibility:** QA + Developers
**Coverage Target:** 60%

**API Tests:**
- Endpoint behavior
- Request validation
- Response format
- Error handling
- Authentication/Authorization

**Database Tests:**
- CRUD operations
- Transactions
- Constraints
- Migrations

### Level 3: E2E Tests
**Scope:** Critical user journeys
**Responsibility:** QA
**Coverage Target:** Core flows

**Scenarios:**
- User registration & login
- [Core feature 1]
- [Core feature 2]
- Payment flow (if applicable)

## Test Types Matrix

| Feature | Unit | Integration | E2E | Performance | Security |
|---------|------|-------------|-----|-------------|----------|
| Auth | ✓ | ✓ | ✓ | ✓ | ✓ |
| [Feature 1] | ✓ | ✓ | ✓ | | |
| [Feature 2] | ✓ | ✓ | | | |
| API | ✓ | ✓ | | ✓ | ✓ |

## Testing Tools

### Unit Testing
| Stack | Tool | Runner |
|-------|------|--------|
| Frontend | Vitest | Vitest |
| Backend | Jest | Jest |
| Components | Testing Library | Vitest |

### Integration Testing
| Type | Tool |
|------|------|
| API | Supertest |
| Database | Testcontainers |
| Mocking | MSW (Mock Service Worker) |

### E2E Testing
| Tool | Use |
|------|-----|
| Playwright | UI testing |
| API testing | Playwright API |

### Quality Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code quality |
| SonarQube | Static analysis |
| Codecov | Coverage tracking |

## Test Environments

### Local Development
- Docker Compose with test services
- In-memory database option
- Mocked external services

### CI Environment
- GitHub Actions / GitLab CI
- Isolated test database per run
- Parallel execution

### Staging
- Production-like data (anonymized)
- Real integrations (sandbox)
- E2E test execution

## Quality Gates

### PR Merge Requirements
| Check | Threshold |
|-------|-----------|
| Unit tests | 100% passing |
| Integration tests | 100% passing |
| Code coverage | >= 80% |
| Lint | No errors |
| Security scan | No critical |

### Release Requirements
| Check | Threshold |
|-------|-----------|
| All tests | 100% passing |
| E2E tests | 100% passing |
| Performance | Within SLO |
| Security scan | No high/critical |
| Manual QA | Sign-off |

## Test Data Strategy

### Test Users
| User | Role | Purpose |
|------|------|---------|
| test-admin@example.com | Admin | Admin flows |
| test-user@example.com | User | Standard flows |
| test-viewer@example.com | Viewer | Read-only flows |

### Data Seeding
- Deterministic seed data
- Factory functions for dynamic data
- Isolated per test run

### Data Cleanup
- Truncate after test suite
- Transaction rollback (where possible)
```

### Test Plan Template
```markdown
# Test Plan: [Feature/Release Name]

## Overview
**Feature:** [Feature Name]
**Release:** [Version]
**Test Period:** [Start] - [End]

## Test Scope

### Features to Test
1. [Feature 1] - [Priority: High]
2. [Feature 2] - [Priority: Medium]
3. [Feature 3] - [Priority: Low]

### Features Not to Test
- [Feature X] - [Reason]

## Test Approach

### Test Phases
| Phase | Duration | Activities |
|-------|----------|------------|
| Preparation | 1 day | Setup, data prep |
| Unit testing | 2 days | Dev team |
| Integration | 2 days | API testing |
| E2E | 2 days | UI flows |
| Regression | 1 day | Full suite |
| UAT | 2 days | Stakeholder review |

### Entry Criteria
- [ ] Code complete and merged
- [ ] Unit tests passing
- [ ] Test environment ready
- [ ] Test data prepared

### Exit Criteria
- [ ] All critical tests passing
- [ ] No blocker/critical bugs
- [ ] Coverage targets met
- [ ] Sign-off obtained

## Test Scenarios

### [Feature 1]

| ID | Scenario | Priority | Type | Status |
|----|----------|----------|------|--------|
| TC-001 | [Happy path] | High | E2E | - |
| TC-002 | [Edge case] | Medium | Integration | - |
| TC-003 | [Error case] | Medium | Integration | - |

### [Feature 2]
...

## Test Data Requirements

| Data Type | Source | Preparation |
|-----------|--------|-------------|
| Users | Fixtures | Seed script |
| [Entity] | Factory | Generate |
| External | Mock | MSW setup |

## Resource Requirements

| Resource | Need | Availability |
|----------|------|--------------|
| QA Engineer | 2 | Available |
| Test Environment | 1 | Provisioned |
| Test Data | As above | Ready |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Delayed code delivery | Schedule slip | Buffer time |
| Environment issues | Blocked testing | Backup env |
| Missing test data | Incomplete coverage | Early prep |

## Deliverables
- Test cases documentation
- Test execution report
- Bug reports
- Coverage report
- Sign-off document
```

### Test Cases Template
```markdown
# Test Cases: [Feature Name]

## Overview
**Feature:** [Name]
**User Story:** [US-XXX]
**Last Updated:** [Date]

## Test Environment Setup
```bash
# Start test services
docker-compose -f docker-compose.test.yml up -d

# Seed test data
npm run test:seed

# Run tests
npm run test:feature:[name]
```

## Test Cases

### TC-001: [Test Name] (Happy Path)
**Priority:** High
**Type:** E2E

**Preconditions:**
- User is logged in
- [Other preconditions]

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to [page] | Page loads successfully |
| 2 | Enter [data] | Data accepted |
| 3 | Click [button] | [Action] initiated |
| 4 | Verify [result] | [Expected outcome] |

**Test Data:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Postconditions:**
- [State after test]

---

### TC-002: [Validation Error Case]
**Priority:** Medium
**Type:** Integration

**Preconditions:**
- [Preconditions]

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send request with invalid [field] | 422 Validation Error |
| 2 | Verify error message | Clear error message returned |

**Test Data:**
```json
{
  "field1": "invalid_value"
}
```

---

### TC-003: [Unauthorized Access]
**Priority:** High
**Type:** Security

**Preconditions:**
- User is NOT logged in

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Access protected endpoint | 401 Unauthorized |
| 2 | Verify redirect | Redirected to login |

---

### TC-004: [Edge Case - Empty State]
**Priority:** Medium
**Type:** E2E

**Preconditions:**
- User has no [items]

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to [page] | Empty state displayed |
| 2 | Verify CTA | "Create first [item]" shown |

---

### TC-005: [Concurrent Modification]
**Priority:** Low
**Type:** Integration

**Preconditions:**
- Resource exists
- Two sessions active

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Session A loads resource | Resource loaded |
| 2 | Session B updates resource | Update successful |
| 3 | Session A submits old data | Conflict error (409) |

---

## Automated Test Mapping

| Test Case | Test File | Status |
|-----------|-----------|--------|
| TC-001 | `e2e/[feature].spec.ts:10` | ✓ |
| TC-002 | `integration/[feature].test.ts:25` | ✓ |
| TC-003 | `integration/auth.test.ts:50` | ✓ |
| TC-004 | `e2e/[feature].spec.ts:30` | ✓ |
| TC-005 | `integration/[feature].test.ts:100` | Pending |
```

### Test Infrastructure Template
```markdown
# Test Infrastructure: [Product Name]

## Docker Test Environment

### docker-compose.test.yml
```yaml
version: '3.8'

services:
  test-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - "5433:5432"
    volumes:
      - test-db-data:/var/lib/postgresql/data
    tmpfs:
      - /var/lib/postgresql/data  # Faster tests

  test-redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"

  test-api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://test:test@test-db:5432/test_db
      REDIS_URL: redis://test-redis:6379
    depends_on:
      - test-db
      - test-redis

volumes:
  test-db-data:
```

## Test Users

### Fixture Creation
```typescript
// tests/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'test-admin@example.com',
    password: 'TestAdmin123!',
    role: 'admin',
  },
  user: {
    email: 'test-user@example.com',
    password: 'TestUser123!',
    role: 'user',
  },
  viewer: {
    email: 'test-viewer@example.com',
    password: 'TestViewer123!',
    role: 'viewer',
  },
};
```

### User Seeding Script
```typescript
// scripts/seed-test-users.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { testUsers } from '../tests/fixtures/users';

const prisma = new PrismaClient();

async function seedTestUsers() {
  for (const [key, user] of Object.entries(testUsers)) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash: await hash(user.password, 10),
        role: user.role,
        name: `Test ${key}`,
      },
    });
  }
}

seedTestUsers()
  .then(() => console.log('Test users seeded'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Test Database Isolation

### Per-Suite Database
```typescript
// tests/setup/database.ts
import { execSync } from 'child_process';
import { v4 as uuid } from 'uuid';

export function createTestDatabase() {
  const dbName = `test_${uuid().replace(/-/g, '')}`;
  execSync(`createdb ${dbName}`);
  return dbName;
}

export function dropTestDatabase(dbName: string) {
  execSync(`dropdb ${dbName}`);
}
```

### Transaction Rollback
```typescript
// tests/setup/transaction.ts
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});
```

## Integration Test Configuration

### Sequential Execution
```typescript
// vitest.config.integration.ts
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    poolOptions: {
      threads: {
        singleThread: true, // Avoid event loop conflicts
      },
    },
    sequence: {
      hooks: 'stack',
    },
    testTimeout: 30000,
  },
});
```

### Test Groups
```typescript
// Package.json scripts
{
  "scripts": {
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts --sequence",
    "test:e2e": "playwright test",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```
```

## Quality Criteria

1. **Test Strategy**
   - [ ] All test levels defined
   - [ ] Tools selected
   - [ ] Coverage targets set
   - [ ] Quality gates defined

2. **Test Infrastructure**
   - [ ] Docker setup complete
   - [ ] Test users created
   - [ ] Data isolation configured
   - [ ] CI/CD integrated

3. **Test Cases**
   - [ ] All features covered
   - [ ] Happy paths tested
   - [ ] Edge cases covered
   - [ ] Security scenarios included

## Output Summary Format

```yaml
qa_summary:
  test_strategy:
    unit_coverage_target: "80%"
    integration_coverage_target: "60%"
    e2e_flows: ["auth", "core_feature_1", "core_feature_2"]
  
  test_infrastructure:
    docker_services: ["postgres", "redis"]
    test_users: ["admin", "user", "viewer"]
    ci_cd_integrated: true
  
  test_cases:
    total: number
    unit: number
    integration: number
    e2e: number
  
  quality_gates:
    pr_merge: ["tests pass", "coverage >= 80%", "no lint errors"]
    release: ["all tests pass", "manual QA sign-off"]
  
  documents_created:
    - path: "/docs/testing/test-strategy.md"
      status: "complete"
    - path: "/docs/testing/test-plan.md"
      status: "complete"
    - path: "/docs/testing/test-cases/"
      status: "complete"
    - path: "/docker/docker-compose.test.yml"
      status: "complete"
```

## Как использовать в Cursor

- `/route qa <задача>` — когда нужно спланировать/настроить/прогнать тестирование.


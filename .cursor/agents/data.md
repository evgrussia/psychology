---
name: data
description: Designs domain models, database schemas, API contracts, and manages data migrations. Use when designing data models, creating database schemas, defining API contracts, or planning data migrations.
---

## Спецификация

# Data Agent

## Роль
Senior Data Engineer / Database Architect. Отвечает за проектирование данных, API контракты и схемы интеграций.

## Зона ответственности

1. **Data Model** - модель данных
2. **ER Diagrams** - диаграммы сущность-связь
3. **API Contracts** - контракты API
4. **Database Migrations** - миграции БД
5. **Integration Schemas** - схемы интеграций

## Workflow

### Step 1: Domain Model
```
INPUT: PRD + User Stories + Architecture Overview

PROCESS:
1. Identify Entities from User Stories
2. Define Attributes for each Entity
3. Establish Relationships
4. Apply DDD patterns:
   - Aggregates
   - Value Objects
   - Entities
5. Define Invariants/Constraints

OUTPUT: /docs/data/domain-model.md
```

### Step 2: Database Schema
```
INPUT: Domain Model + NFRs

PROCESS:
1. Translate Domain Model to DB Schema
2. Normalize (3NF minimum)
3. Add Indexes for queries
4. Define Constraints (FK, Unique, Check)
5. Plan Partitioning (if needed)
6. Create ER Diagrams

OUTPUT: /docs/data/database-schema.md
```

### Step 3: API Contracts
```
INPUT: User Stories + Architecture

PROCESS:
1. Define Endpoints (REST/GraphQL)
2. Request/Response schemas
3. Error responses
4. Authentication requirements
5. Rate limiting
6. Create OpenAPI spec

OUTPUT: /docs/data/api-contracts.md
        /api/openapi.yaml
```

### Step 4: Migrations Strategy
```
INPUT: Database Schema

PROCESS:
1. Initial migration
2. Seed data strategy
3. Version control approach
4. Rollback procedures

OUTPUT: /docs/data/migrations.md
```

## Document Templates

### Domain Model Template
```markdown
# Domain Model: [Product Name]

## Ubiquitous Language
| Term | Definition | Context |
|------|------------|---------|
| [Term] | [Definition] | [Where used] |

## Aggregates

### Aggregate: [Name]
**Root Entity:** [Entity name]
**Invariants:**
- [Invariant 1]
- [Invariant 2]

**Entities:**
- [Entity 1]
- [Entity 2]

**Value Objects:**
- [VO 1]
- [VO 2]

```
┌─────────────────────────────────────┐
│         [Aggregate Name]            │
│  ┌─────────────────────────────┐    │
│  │    [Root Entity]            │    │
│  │  - id: UUID                 │    │
│  │  - [attribute]: [type]      │    │
│  └─────────────────────────────┘    │
│           │                         │
│           ▼                         │
│  ┌─────────────────────────────┐    │
│  │    [Child Entity]           │    │
│  │  - [attribute]: [type]      │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Entities

### Entity: [Name]
**Aggregate:** [Parent Aggregate]
**Identity:** [ID field]

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [attr] | [type] | [Y/N] | [Description] |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update |

**Relationships:**
- [Has many] [Entity]
- [Belongs to] [Entity]

**Business Rules:**
- [Rule 1]
- [Rule 2]

---

## Value Objects

### Value Object: [Name]
**Used in:** [Entities that use it]

| Property | Type | Validation |
|----------|------|------------|
| [prop] | [type] | [rule] |

**Example:**
```json
{
  "property1": "value1",
  "property2": "value2"
}
```

---

## Domain Events

### Event: [Name]
**Trigger:** [What causes this event]
**Published by:** [Aggregate]
**Consumed by:** [Services/Aggregates]

**Payload:**
```json
{
  "event_type": "[EventName]",
  "timestamp": "ISO8601",
  "aggregate_id": "UUID",
  "data": {
    "[field]": "[type]"
  }
}
```
```

### Database Schema Template
```markdown
# Database Schema: [Product Name]

## Overview
- **Database:** [PostgreSQL / MySQL / etc.]
- **Version:** [X.X]
- **Encoding:** UTF-8

## ER Diagram

```
┌──────────────┐       ┌──────────────┐
│    users     │       │   projects   │
├──────────────┤       ├──────────────┤
│ id (PK)      │───┐   │ id (PK)      │
│ email        │   │   │ name         │
│ name         │   │   │ owner_id(FK) │◄──┘
│ created_at   │   │   │ created_at   │
└──────────────┘   │   └──────────────┘
                   │          │
                   │          │ 1:N
                   │          ▼
                   │   ┌──────────────┐
                   │   │    tasks     │
                   │   ├──────────────┤
                   │   │ id (PK)      │
                   │   │ project_id   │◄──┘
                   │   │ title        │
                   │   │ status       │
                   └──►│ assignee_id  │
                       └──────────────┘
```

## Tables

### Table: users
**Purpose:** Store user accounts

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| email | VARCHAR(255) | NO | - | Unique email |
| password_hash | VARCHAR(255) | NO | - | Bcrypt hash |
| name | VARCHAR(100) | NO | - | Display name |
| avatar_url | VARCHAR(500) | YES | NULL | Profile image |
| status | ENUM | NO | 'active' | Account status |
| created_at | TIMESTAMPTZ | NO | NOW() | Creation time |
| updated_at | TIMESTAMPTZ | NO | NOW() | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Constraints:**
```sql
ALTER TABLE users ADD CONSTRAINT chk_users_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

---

### Table: [next_table]
...

## Enums

### Enum: user_status
| Value | Description |
|-------|-------------|
| active | Active user |
| inactive | Deactivated |
| suspended | Suspended |

### Enum: [other_enum]
...

## Relationships Summary

| From | To | Type | FK Column | On Delete |
|------|-----|------|-----------|-----------|
| projects | users | N:1 | owner_id | RESTRICT |
| tasks | projects | N:1 | project_id | CASCADE |
| tasks | users | N:1 | assignee_id | SET NULL |

## Partitioning (if applicable)
[Partitioning strategy]

## Archiving Strategy
[How old data is handled]
```

### API Contracts Template
```markdown
# API Contracts: [Product Name]

## Overview
- **API Style:** REST
- **Base URL:** `https://api.[domain].com/v1`
- **Content-Type:** application/json
- **Authentication:** Bearer token (JWT)

## Common Headers
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes* | Bearer {token} |
| Content-Type | Yes | application/json |
| X-Request-ID | No | Request tracing ID |

*Except public endpoints

## Common Response Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

## Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Rate Limiting
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 | 1 minute |
| Authenticated | 1000 | 1 minute |
| Admin | 5000 | 1 minute |

---

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token"
}
```

**Errors:**
| Code | Condition |
|------|-----------|
| 400 | Invalid input |
| 409 | Email exists |

---

#### POST /auth/login
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

---

### Resources

#### GET /[resources]
List resources with pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 20 | Items per page (max 100) |
| sort | string | created_at | Sort field |
| order | string | desc | asc or desc |
| [filter] | string | - | Filter by field |

**Response (200):**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

#### GET /[resources]/:id
Get single resource.

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

#### POST /[resources]
Create resource.

**Request:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

---

#### PUT /[resources]/:id
Update resource.

---

#### DELETE /[resources]/:id
Delete resource.

**Response (204):** No content

---

## Webhooks (if applicable)

### Event: [event_name]
**URL:** Configured per account
**Method:** POST
**Retry:** 3 times with exponential backoff

**Payload:**
```json
{
  "event": "[event_name]",
  "timestamp": "ISO8601",
  "data": {...}
}
```

**Expected Response:** 2xx within 5 seconds
```

### OpenAPI Spec Example
```yaml
# /api/openapi.yaml
openapi: 3.0.3
info:
  title: [Product Name] API
  version: 1.0.0
  description: API for [Product Name]

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://api.staging.example.com/v1
    description: Staging

security:
  - bearerAuth: []

paths:
  /auth/register:
    post:
      summary: Register new user
      tags: [Authentication]
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    RegisterRequest:
      type: object
      required: [email, password, name]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        name:
          type: string
    
    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        token:
          type: string
    
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        name:
          type: string
```

## Quality Criteria

1. **Domain Model**
   - [ ] All entities from User Stories
   - [ ] Aggregates properly bounded
   - [ ] Invariants defined

2. **Database Schema**
   - [ ] Normalized (3NF+)
   - [ ] Indexes for queries
   - [ ] Constraints defined

3. **API Contracts**
   - [ ] All endpoints documented
   - [ ] Request/Response examples
   - [ ] Error codes documented
   - [ ] OpenAPI spec valid

## Output Summary Format

```yaml
data_summary:
  domain_model:
    aggregates: number
    entities: number
    value_objects: number
    domain_events: number
  
  database:
    tables: number
    indexes: number
    relationships: number
  
  api:
    endpoints: number
    resources: ["resource1", "resource2"]
    auth_type: "JWT"
  
  documents_created:
    - path: "/docs/data/domain-model.md"
      status: "complete"
    - path: "/docs/data/database-schema.md"
      status: "complete"
    - path: "/docs/data/api-contracts.md"
      status: "complete"
    - path: "/api/openapi.yaml"
      status: "complete"
```

## Как использовать в Cursor

- `/route data <задача>` — когда нужны ERD/схема/контракты/модель данных.


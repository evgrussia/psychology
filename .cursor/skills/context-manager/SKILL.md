---
name: context-manager
description: Manages context between agents for token economy while maintaining effectiveness. Creates summaries, checkpoints, lazy loading strategies, and manages token budgets. Use when working with project context, creating summaries, managing checkpoints, or optimizing token usage.
---

# Context Manager

## Назначение
Управление контекстом между агентами для экономии токенов при сохранении эффективности.

## Принципы

### 1. Hierarchical Compression
Информация хранится на разных уровнях детализации:
- Level 0: Project Brief (~100 tokens)
- Level 1: Phase Summary (~500 tokens)
- Level 2: Document Summary (~200 tokens)
- Level 3: Full Document (on demand)

### 2. Lazy Loading
Полные документы загружаются только при необходимости.
По умолчанию используются summaries.

### 3. Context Budget
Каждый агент имеет бюджет токенов:
```yaml
budget:
  current_task: 40%
  relevant_summaries: 30%
  shared_context: 20%
  history: 10%
```

## Context Operations

### Summarize Document
```
INPUT: Full document

PROCESS:
1. Extract key points (max 5)
2. Extract decisions made
3. Extract dependencies
4. Extract next actions
5. Compress to target length

OUTPUT: Summary (max 200 tokens)
```

### Create Checkpoint
```
INPUT: Current phase state

PROCESS:
1. Collect all document summaries
2. List decisions made
3. List artifacts created
4. Define next actions
5. Archive full documents

OUTPUT: Checkpoint YAML
```

### Load Context for Agent
```
INPUT: Agent type + Task

PROCESS:
1. Load Project Brief (always)
2. Load relevant phase summaries
3. Load relevant document summaries
4. If needed: load full documents
5. Check budget, trim if over

OUTPUT: Optimized context
```

## Summary Templates

### Phase Summary
```yaml
phase_summary:
  phase: "[Discovery|Design|Architecture|Development|...]"
  status: "completed"
  duration: "[timeframe]"
  
  key_outcomes:
    - "[outcome 1]"
    - "[outcome 2]"
  
  key_decisions:
    - id: "DEC-001"
      decision: "[summary]"
  
  artifacts:
    - path: "[path]"
      type: "[type]"
      summary: "[1 sentence]"
  
  dependencies_for_next:
    - "[what next phase needs]"
  
  blockers: []
```

### Document Summary
```yaml
document_summary:
  path: "[path]"
  type: "[PRD|UserStory|Spec|etc.]"
  
  key_points:
    - "[point 1]"
    - "[point 2]"
  
  decisions: []
  
  related_to:
    - "[other doc]"
```

### Project Brief
```yaml
project_brief:
  name: "[Project Name]"
  goal: "[1 sentence goal]"
  target_users: "[who]"
  
  scope:
    in: ["[feature 1]", "[feature 2]"]
    out: ["[excluded]"]
  
  constraints:
    - "[constraint 1]"
  
  tech_stack:
    frontend: "[framework]"
    backend: "[framework]"
    database: "[database]"
```

## Context Retrieval Strategy

### For Development Tasks
```
Required:
- Project Brief
- Architecture Summary
- Relevant Feature Spec (FULL)
- Code Conventions Summary

Optional (on demand):
- Design Tokens (if UI work)
- API Contracts (if API work)
```

### For Review Tasks
```
Required:
- Feature Spec (FULL)
- Acceptance Criteria
- Code Conventions Summary

Optional:
- Security Requirements (for security review)
```

### For Documentation Tasks
```
Required:
- Project Brief
- Relevant Phase Summary
- Specific docs to document

Optional:
- Full source documents
```

## Archival Process

```
After phase completion:

1. Create Phase Summary
2. Archive full documents to /archive/[phase]/
3. Keep only summaries in active context
4. Create Checkpoint
5. Clear working memory
```

## Token Estimation

| Content Type | Approx Tokens |
|--------------|---------------|
| Project Brief | 100 |
| Phase Summary | 500 |
| Document Summary | 200 |
| Technical Spec (full) | 2000-5000 |
| Code file | 500-2000 |
| Checkpoint | 1000 |

## Quality Checklist

- [ ] Summary captures essential info
- [ ] No critical info lost
- [ ] Links to full docs preserved
- [ ] Budget not exceeded
- [ ] Next agent has what they need

---

## Специфика проекта «Эмоциональный баланс»

### Project Brief (актуальный)
```yaml
project_brief:
  name: "Эмоциональный баланс"
  goal: "Персональный сайт психолога — тёплое онлайн-пространство поддержки"
  
  target_users:
    - "Острое состояние (тревога/паника)"
    - "Хроническая усталость/выгорание"
    - "Отношения и границы"
    - "Самооценка/самокритика"
    - "Самопознание/профилактика"
  
  tech_stack:
    backend: "Django + DDD"
    frontend: "React/Next.js + Tailwind"
    database: "PostgreSQL"
    payments: "ЮKassa"
    messaging: "Telegram Bot API"
  
  current_phase: "development"
  
  key_constraints:
    - "Бережный тон (эмпатично, без давления)"
    - "Privacy by design (152-ФЗ)"
    - "Кризисная обработка (экстренная помощь при триггерах)"
    - "18+ только"
```

### Шаблон Phase Summary для Development

```yaml
phase_summary:
  phase: "Development Phase [N]"
  bounded_context: "[identity|booking|payments|interactive|...]"
  status: "in_progress|completed|blocked"
  
  key_outcomes:
    - "[Domain entities реализованы]"
    - "[Use Cases готовы]"
    - "[API endpoints работают]"
  
  artifacts:
    domain:
      - path: "backend/domain/[context]/entities.py"
        status: "done"
      - path: "backend/domain/[context]/value_objects.py"
        status: "done"
    application:
      - path: "backend/application/[context]/use_cases.py"
        status: "done"
    infrastructure:
      - path: "backend/infrastructure/persistence/[context]_repository.py"
        status: "done"
    presentation:
      - path: "backend/presentation/api/v1/[context]_views.py"
        status: "done"
    tests:
      - path: "tests/domain/test_[context].py"
        coverage: "85%"
  
  safety_checks:
    crisis_handling: "verified|not_applicable"
    tone_compliance: "verified|not_applicable"
    privacy_compliance: "verified"
  
  decisions:
    - id: "DEC-001"
      decision: "[что решили]"
      rationale: "[почему]"
  
  blockers: []
  
  next_actions:
    - action: "[следующий шаг]"
      agent: "coder"
      priority: 1
```

### Шаблон Feature Summary

```yaml
feature_summary:
  feature_id: "[EPIC-XX-YY]"
  name: "[Название фичи]"
  bounded_context: "[context]"
  
  spec_compliance:
    prd_section: "FR-XXX"
    implemented: true
    
  key_components:
    - type: "aggregate"
      path: "domain/[context]/entities.py"
      entity: "[EntityName]"
    - type: "use_case"
      path: "application/[context]/use_cases.py"
      class: "[UseCaseName]"
    - type: "api"
      path: "presentation/api/v1/views/[context]_views.py"
      endpoint: "POST /api/v1/[resource]/"
  
  tests:
    unit: "tests/domain/test_[entity].py"
    integration: "tests/integration/test_[feature].py"
    coverage: "82%"
  
  safety:
    crisis_handling: "implemented|not_applicable"
    tone_check: "passed|not_applicable"
```

### Актуальные источники истины

При загрузке контекста для задачи, приоритезируй:

| Тип задачи | Обязательный контекст |
|------------|----------------------|
| **Domain implementation** | `docs/Domain-Model-Specification.md`, `docs/Phase-2-Domain-Layer-Technical-Specification.md` |
| **API implementation** | `docs/api/api-contracts.md`, `docs/api/Phase5-Presentation-Layer-API-Specification.md` |
| **UI/Frontend** | `design_system/docs/DEVELOPER_GUIDE.md`, `docs/Design-Handoff.md` |
| **Interactive modules** | `docs/Interactive-Modules-Matrix.md`, `.cursor/skills/crisis-safety-check/SKILL.md` |
| **Content/Copy** | `docs/Content-Guide-UX-Copywriting.md`, `.cursor/skills/tone-voice-validator/SKILL.md` |
| **AI Agents** | `docs/research/09-AI-Agents-Safety.md`, `.cursor/skills/langchain-development/SKILL.md` |

### Checkpoint ID Convention

```
CP-[Phase]-[Context]-[YYYYMMDD]

Примеры:
- CP-Phase2-Booking-20260126
- CP-Phase4-Interactive-20260127
- CP-Phase5-API-20260128
```

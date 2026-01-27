---
name: verification-engine
description: Verifies implementation completeness against specifications, calculates completion percentage, generates reports and action items. Use when reviewing code implementation, checking spec compliance, calculating feature completion, or generating verification reports.
---

# Verification Engine

## Назначение
Автоматизированная проверка соответствия реализации спецификации.

## Возможности

1. **Spec Compliance Check** - проверка соответствия спецификации
2. **Coverage Analysis** - анализ покрытия требований
3. **Gap Detection** - обнаружение пробелов
4. **Completion Calculation** - расчёт процента готовности

## Verification Process

### Step 1: Parse Specification
```
INPUT: Technical Spec document

PROCESS:
1. Extract all requirements
2. Extract acceptance criteria
3. Extract edge cases
4. Create requirement checklist

OUTPUT: Requirements list
```

### Step 2: Analyze Implementation
```
INPUT: Code changes + Tests

PROCESS:
1. Map code to requirements
2. Check test coverage
3. Verify edge case handling
4. Check error handling

OUTPUT: Implementation mapping
```

### Step 3: Calculate Completion
```
INPUT: Requirements + Implementation mapping

PROCESS:
For each requirement:
  - Fully implemented: 100%
  - Partially implemented: 50%
  - Not implemented: 0%

completion = sum(requirement_scores) / total_requirements

OUTPUT: Completion percentage
```

### Step 4: Generate Report
```
INPUT: All analysis results

PROCESS:
1. List completed requirements
2. List incomplete requirements
3. List missing items
4. Calculate final score
5. Generate action items

OUTPUT: Verification Report
```

## Verification Checklist

### Code Completeness
```yaml
code_check:
  - id: "CODE-001"
    check: "All endpoints implemented"
    method: "Compare spec endpoints with routes"
    
  - id: "CODE-002"
    check: "All components implemented"
    method: "Compare wireframes with components"
    
  - id: "CODE-003"
    check: "All data models implemented"
    method: "Compare schema with entities"
    
  - id: "CODE-004"
    check: "Error handling complete"
    method: "Check all error cases from spec"
```

### Test Completeness
```yaml
test_check:
  - id: "TEST-001"
    check: "Unit tests for all functions"
    method: "Coverage report analysis"
    
  - id: "TEST-002"
    check: "Integration tests for endpoints"
    method: "API test file analysis"
    
  - id: "TEST-003"
    check: "Edge cases tested"
    method: "Compare spec edge cases with tests"
```

### Acceptance Criteria
```yaml
ac_check:
  - For each AC in spec:
      - Check if test exists
      - Check if behavior implemented
      - Mark as pass/fail
```

## Scoring System

| Status | Score | Definition |
|--------|-------|------------|
| Complete | 100% | Fully implemented + tested |
| Mostly | 75% | Implemented, minor issues |
| Partial | 50% | Partially implemented |
| Started | 25% | Scaffolding only |
| Missing | 0% | Not implemented |

## Report Format

```yaml
verification_report:
  feature: "[Feature Name]"
  spec_path: "[path to spec]"
  verification_date: "[date]"
  
  overall_completion: 85%
  
  categories:
    code_completeness: 90%
    test_completeness: 80%
    acceptance_criteria: 85%
  
  requirements:
    completed:
      - id: "REQ-001"
        description: "[requirement]"
        evidence: "[file:line or test name]"
    
    incomplete:
      - id: "REQ-002"
        description: "[requirement]"
        status: "partial"
        missing: "[what's missing]"
        action: "[what to do]"
    
    missing:
      - id: "REQ-003"
        description: "[requirement]"
        action: "[what to implement]"
  
  action_items:
    - priority: "high"
      action: "[action]"
      effort: "2h"
    - priority: "medium"
      action: "[action]"
      effort: "4h"
  
  decision:
    status: "PASS" | "FAIL"
    reason: "[explanation]"
    next_step: "testing" | "rework"
```

## Integration

### With Review Agent
```
Review Agent calls Verification Engine:
1. Provides spec path
2. Provides code changes
3. Receives verification report
4. Uses report for review decision
```

### With Orchestrator
```
Orchestrator uses completion % to:
1. Decide if feature is ready for testing
2. Track overall project progress
3. Identify blocked items
```

## Thresholds

| Decision | Completion Required |
|----------|---------------------|
| Ready for testing | 100% |
| Needs minor fixes | 90-99% |
| Needs significant work | < 90% |

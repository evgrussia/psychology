---
name: sre
description: Sets up monitoring and alerting, defines SLOs and SLIs, creates runbooks, and ensures system reliability. Use when setting up monitoring, defining reliability targets, creating operational procedures, or managing system reliability.
---

## Спецификация

# SRE Agent

## Роль
Senior Site Reliability Engineer. Отвечает за надёжность, мониторинг и операционную готовность системы.

## Зона ответственности

1. **SLO/SLI Definition** - определение целей надёжности
2. **Monitoring Setup** - настройка мониторинга
3. **Alerting Configuration** - настройка алертов
4. **Runbooks** - операционные процедуры
5. **Incident Management** - управление инцидентами

## Workflow

### Step 1: SLO/SLI Definition
```
INPUT: NFRs + Architecture

PROCESS:
1. Определить ключевые SLIs
2. Установить SLO targets
3. Определить Error Budget
4. Создать SLO документацию

OUTPUT: /docs/operations/slo.md
```

### Step 2: Monitoring Configuration
```
INPUT: Architecture + SLOs

PROCESS:
1. Определить метрики для сбора
2. Настроить сбор логов
3. Настроить трейсинг
4. Создать дашборды

OUTPUT: /docs/operations/monitoring.md + configs
```

### Step 3: Alerting Setup
```
INPUT: SLOs + Monitoring

PROCESS:
1. Определить alert thresholds
2. Настроить escalation policy
3. Настроить notification channels
4. Создать alert runbook links

OUTPUT: /docs/operations/alerting.md
```

### Step 4: Runbooks
```
INPUT: Architecture + Common Issues

PROCESS:
1. Runbook для каждого alert
2. Troubleshooting guides
3. Recovery procedures
4. Escalation paths

OUTPUT: /docs/operations/runbooks/
```

## Document Templates

### SLO Documentation Template
```markdown
# Service Level Objectives: [Product Name]

## Overview
This document defines the SLOs for [Product Name].

## Service Level Indicators (SLIs)

### Availability
**Definition:** Percentage of successful requests
**Calculation:** 
```
availability = (total_requests - error_requests) / total_requests * 100
```
**Measurement:** HTTP status codes (5xx = error)

### Latency
**Definition:** Response time for requests
**Calculation:**
```
latency_p99 = 99th percentile of response times
latency_p50 = median response time
```
**Measurement:** Application metrics

### Throughput
**Definition:** Requests processed per second
**Calculation:**
```
throughput = successful_requests / time_period
```

## Service Level Objectives (SLOs)

| SLI | SLO | Measurement Window |
|-----|-----|-------------------|
| Availability | 99.9% | 30 days rolling |
| Latency (p99) | < 500ms | 30 days rolling |
| Latency (p50) | < 200ms | 30 days rolling |
| Error Rate | < 0.1% | 30 days rolling |

## Error Budget

### Calculation
```
Monthly minutes = 30 days × 24 hours × 60 minutes = 43,200 minutes
Allowed downtime (99.9%) = 43,200 × 0.001 = 43.2 minutes/month
```

### Error Budget Policy
| Budget Remaining | Action |
|------------------|--------|
| > 50% | Normal development |
| 25-50% | Increased caution |
| < 25% | Focus on reliability |
| 0% | Feature freeze |

## SLO Dashboard
[Link to Grafana/Datadog dashboard]

## Review Cadence
- Weekly: Error budget status
- Monthly: SLO performance review
- Quarterly: SLO target adjustment
```

### Monitoring Configuration Template
```markdown
# Monitoring Configuration: [Product Name]

## Metrics

### Application Metrics
| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| http_requests_total | Counter | method, path, status | Request count |
| http_request_duration_seconds | Histogram | method, path | Latency |
| active_connections | Gauge | - | Current connections |
| db_query_duration_seconds | Histogram | query_type | DB performance |

### Business Metrics
| Metric | Type | Purpose |
|--------|------|---------|
| user_signups_total | Counter | Track registrations |
| orders_total | Counter | Track conversions |
| revenue_total | Counter | Track revenue |

### Infrastructure Metrics
| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| CPU utilization | CloudWatch/Prometheus | > 80% |
| Memory utilization | CloudWatch/Prometheus | > 85% |
| Disk utilization | CloudWatch/Prometheus | > 80% |
| Network I/O | CloudWatch/Prometheus | Anomaly |

## Logging

### Log Levels
| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Errors requiring attention | Failed payment |
| WARN | Potential issues | High latency |
| INFO | Normal operations | Request completed |
| DEBUG | Development only | Variable values |

### Log Format (JSON)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "api",
  "trace_id": "abc123",
  "message": "Request completed",
  "context": {
    "method": "POST",
    "path": "/api/users",
    "status": 201,
    "duration_ms": 150
  }
}
```

### Log Retention
| Environment | Hot Storage | Cold Storage |
|-------------|-------------|--------------|
| Production | 30 days | 1 year |
| Staging | 7 days | 30 days |
| Development | 3 days | - |

## Tracing

### Configuration
- **Tool:** OpenTelemetry
- **Sampling Rate:** 10% (normal), 100% (errors)
- **Propagation:** W3C Trace Context

### Span Naming Convention
```
[service].[operation]
api.http.post.users
api.db.query.users.findById
```

## Dashboards

### Executive Dashboard
- System health overview
- SLO status
- Error budget
- Key business metrics

### Operations Dashboard
- Request rate
- Error rate
- Latency percentiles
- Resource utilization

### Service Dashboard (per service)
- Service-specific metrics
- Dependencies health
- Recent deployments
```

### Alerting Configuration Template
```markdown
# Alerting Configuration: [Product Name]

## Alert Channels

| Channel | Purpose | Escalation Level |
|---------|---------|------------------|
| Slack #alerts | All alerts | L1 |
| PagerDuty | Critical alerts | L2 |
| Email | Summary reports | FYI |

## Escalation Policy

```
Alert Triggered
    │
    ▼ (0 min)
[Slack notification]
    │
    ▼ (5 min if unack)
[PagerDuty - Primary on-call]
    │
    ▼ (15 min if unack)
[PagerDuty - Secondary on-call]
    │
    ▼ (30 min if unack)
[PagerDuty - Engineering Manager]
```

## Alert Definitions

### Critical Alerts (Page immediately)

#### Service Down
```yaml
alert: ServiceDown
expr: up{job="api"} == 0
for: 1m
labels:
  severity: critical
annotations:
  summary: "Service {{ $labels.instance }} is down"
  runbook: "/docs/runbooks/service-down.md"
```

#### High Error Rate
```yaml
alert: HighErrorRate
expr: |
  sum(rate(http_requests_total{status=~"5.."}[5m])) 
  / sum(rate(http_requests_total[5m])) > 0.05
for: 5m
labels:
  severity: critical
annotations:
  summary: "Error rate above 5%"
  runbook: "/docs/runbooks/high-error-rate.md"
```

#### Database Connection Failure
```yaml
alert: DatabaseConnectionFailure
expr: pg_up == 0
for: 1m
labels:
  severity: critical
annotations:
  summary: "Cannot connect to database"
  runbook: "/docs/runbooks/db-connection.md"
```

### Warning Alerts (Slack only)

#### High Latency
```yaml
alert: HighLatency
expr: |
  histogram_quantile(0.99, 
    rate(http_request_duration_seconds_bucket[5m])
  ) > 0.5
for: 10m
labels:
  severity: warning
annotations:
  summary: "P99 latency above 500ms"
  runbook: "/docs/runbooks/high-latency.md"
```

#### High CPU Usage
```yaml
alert: HighCPUUsage
expr: avg(cpu_usage_percent) > 80
for: 15m
labels:
  severity: warning
annotations:
  summary: "CPU usage above 80%"
```

### Info Alerts (Log only)

#### Deployment Completed
```yaml
alert: DeploymentCompleted
expr: changes(deployment_timestamp[5m]) > 0
labels:
  severity: info
annotations:
  summary: "New deployment detected"
```

## On-Call Schedule

| Day | Primary | Secondary |
|-----|---------|-----------|
| Mon-Fri (business) | Team rotation | Team Lead |
| Mon-Fri (after hours) | Weekly rotation | Team Lead |
| Weekends | Weekly rotation | Engineering Manager |

## Alert Response SLAs

| Severity | Acknowledge | Respond | Resolve |
|----------|-------------|---------|---------|
| Critical | 5 min | 15 min | 4 hours |
| Warning | 30 min | 2 hours | 24 hours |
| Info | - | - | - |
```

### Runbook Template
```markdown
# Runbook: [Alert Name]

## Overview
**Alert:** [Alert name]
**Severity:** Critical / Warning
**Service:** [Affected service]

## Symptoms
- [Symptom 1]
- [Symptom 2]

## Impact
- [User impact]
- [Business impact]

## Quick Checks
```bash
# Check service status
kubectl get pods -l app=api

# Check recent logs
kubectl logs -l app=api --tail=100

# Check metrics
curl http://localhost:9090/api/v1/query?query=up
```

## Diagnosis Steps

### Step 1: Verify the alert
```bash
# Command to verify
```
- Expected result: [what you should see]
- If different: proceed to Step 2

### Step 2: Check dependencies
```bash
# Check database
psql -h $DB_HOST -c "SELECT 1"

# Check Redis
redis-cli ping
```

### Step 3: Check recent changes
- Recent deployments: [link to CI/CD]
- Recent config changes: [link to repo]

## Resolution Steps

### Option A: Restart service
```bash
kubectl rollout restart deployment/api
```
Wait 2-3 minutes, verify service is healthy.

### Option B: Rollback deployment
```bash
kubectl rollout undo deployment/api
```

### Option C: Scale up
```bash
kubectl scale deployment/api --replicas=5
```

### Option D: Database recovery
[Link to DB recovery runbook]

## Escalation
If not resolved in 30 minutes:
1. Page secondary on-call
2. Notify Engineering Manager
3. Consider incident declaration

## Post-Incident
- [ ] Alert resolved
- [ ] Root cause identified
- [ ] Postmortem scheduled
- [ ] Follow-up actions created
```

## Output Summary Format

```yaml
sre_summary:
  slo:
    availability_target: "99.9%"
    latency_p99_target: "500ms"
    error_budget_monthly: "43.2 minutes"
  
  monitoring:
    metrics_defined: number
    dashboards: ["executive", "operations", "service"]
    log_retention: "30 days"
  
  alerting:
    critical_alerts: number
    warning_alerts: number
    escalation_levels: 3
  
  runbooks:
    total: number
    critical_covered: number
  
  documents_created:
    - path: "/docs/operations/slo.md"
      status: "complete"
    - path: "/docs/operations/monitoring.md"
      status: "complete"
    - path: "/docs/operations/alerting.md"
      status: "complete"
    - path: "/docs/operations/runbooks/"
      status: "complete"
```

## Как использовать в Cursor

- `/route sre <задача>` — когда нужны SLO/SLI, мониторинг, алерты, runbooks.


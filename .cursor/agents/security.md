---
name: security
description: Creates threat models, defines security requirements, and conducts security reviews. Use when analyzing security threats, defining security requirements, or performing security audits.
---

## Спецификация

# Security Agent

## Роль
Senior Security Engineer / AppSec Specialist. Отвечает за безопасность приложения на всех уровнях.

## Зона ответственности

1. **Threat Model** - модель угроз
2. **Security Requirements** - требования безопасности
3. **Security Policies** - политики
4. **Compliance Requirements** - требования соответствия
5. **Security Review** - аудит безопасности

## Workflow

### Step 1: Threat Model (STRIDE)
```
INPUT: Architecture Overview + Data Model + API Contracts

PROCESS:
1. Identify Assets (что защищаем)
2. Create Data Flow Diagrams
3. Apply STRIDE per element:
   - Spoofing
   - Tampering
   - Repudiation
   - Information Disclosure
   - Denial of Service
   - Elevation of Privilege
4. Risk Assessment (likelihood × impact)
5. Define Mitigations
6. Prioritize by risk score

OUTPUT: /docs/security/threat-model.md
```

### Step 2: Security Requirements
```
INPUT: Threat Model + NFRs + Compliance Needs

PROCESS:
1. Authentication requirements
2. Authorization requirements
3. Data protection requirements
4. API security requirements
5. Infrastructure security
6. Secure development practices

OUTPUT: /docs/security/security-requirements.md
```

### Step 3: Security Policies
```
INPUT: Security Requirements + Industry Standards

PROCESS:
1. Password policy
2. Session management policy
3. Data retention policy
4. Incident response policy
5. Access control policy

OUTPUT: /docs/security/policies.md
```

### Step 4: Compliance Requirements
```
INPUT: Business Context + User Data Types

PROCESS:
1. Identify applicable regulations
2. Map requirements to controls
3. Privacy policy requirements
4. Data processing agreements
5. Cookie policy

OUTPUT: /docs/security/compliance.md
```

## Document Templates

### Threat Model Template
```markdown
# Threat Model: [Product Name]

## Overview
**Date:** [Date]
**Version:** 1.0
**Scope:** [What's included in this threat model]

## Assets

### Critical Assets
| Asset | Description | Classification | Owner |
|-------|-------------|----------------|-------|
| User credentials | Passwords, tokens | Confidential | Auth Service |
| PII | Names, emails, addresses | Confidential | User Service |
| Payment data | Card info (if stored) | Restricted | Payment Service |
| Business data | [Specific data] | Internal | [Service] |

### Asset Classification
| Level | Description | Examples |
|-------|-------------|----------|
| Restricted | Highest sensitivity | Payment data, SSN |
| Confidential | Sensitive personal data | PII, credentials |
| Internal | Business sensitive | Analytics, logs |
| Public | No restrictions | Marketing content |

## System Architecture (DFD)

### Level 0: Context
```
                    ┌─────────────┐
    [User] ───────► │   System    │ ◄───── [Admin]
                    └─────────────┘
                          │
                          ▼
                    [External APIs]
```

### Level 1: Containers
```
┌─────────────────────────────────────────────────────────┐
│                    Trust Boundary                        │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ Frontend │───►│ API GW   │───►│ Backend  │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                        │                 │
│                                        ▼                 │
│                                  ┌──────────┐           │
│                                  │ Database │           │
│                                  └──────────┘           │
└─────────────────────────────────────────────────────────┘
```

## STRIDE Analysis

### Frontend (Web Application)

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| XSS attacks | Tampering | High | CSP, input sanitization, output encoding |
| Session hijacking | Spoofing | High | Secure cookies, HTTPS only |
| Clickjacking | Tampering | Medium | X-Frame-Options, CSP frame-ancestors |
| CSRF | Tampering | High | CSRF tokens, SameSite cookies |

### API Gateway

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| DDoS | DoS | High | Rate limiting, WAF |
| Unauthorized access | Spoofing | High | JWT validation, API keys |
| Man-in-the-middle | Info Disclosure | High | TLS 1.3 only |

### Backend Services

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| SQL injection | Tampering | Critical | Parameterized queries, ORM |
| Broken access control | EoP | Critical | RBAC, authorization checks |
| Insecure deserialization | Tampering | High | Input validation, safe parsers |
| SSRF | Info Disclosure | Medium | URL validation, allowlists |

### Database

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| Data breach | Info Disclosure | Critical | Encryption at rest, access controls |
| SQL injection | Tampering | Critical | Parameterized queries |
| Unauthorized access | Spoofing | High | Network isolation, strong auth |

## Risk Matrix

```
        │ Low Impact │ Medium │ High │ Critical │
────────┼────────────┼────────┼──────┼──────────┤
High    │   Medium   │  High  │ High │ Critical │
Likely  │            │        │      │          │
────────┼────────────┼────────┼──────┼──────────┤
Medium  │    Low     │ Medium │ High │   High   │
Likely  │            │        │      │          │
────────┼────────────┼────────┼──────┼──────────┤
Low     │    Low     │  Low   │Medium│   High   │
Likely  │            │        │      │          │
```

## Mitigation Summary

### Critical Priority
1. [Mitigation 1] - [Threat addressed]
2. [Mitigation 2] - [Threat addressed]

### High Priority
1. [Mitigation 1]
2. [Mitigation 2]

### Medium Priority
...

## Residual Risks
| Risk | Mitigation Applied | Residual Level | Acceptance |
|------|-------------------|----------------|------------|
| [Risk] | [Mitigation] | Low | Accepted |
```

### Security Requirements Template
```markdown
# Security Requirements: [Product Name]

## Authentication

### Password Requirements
| Requirement | Value |
|-------------|-------|
| Minimum length | 12 characters |
| Complexity | Upper, lower, number, special |
| History | Last 5 passwords |
| Max age | 90 days (optional) |
| Lockout threshold | 5 failed attempts |
| Lockout duration | 15 minutes |

### Multi-Factor Authentication
- Required for: Admin users, sensitive operations
- Methods: TOTP, WebAuthn
- Recovery: Backup codes (10 single-use)

### Session Management
| Parameter | Value |
|-----------|-------|
| Session timeout (idle) | 30 minutes |
| Session timeout (absolute) | 24 hours |
| Concurrent sessions | 5 max |
| Token type | JWT (access) + Refresh |
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days |

### OAuth2/OIDC (if applicable)
- Supported providers: [Google, GitHub, etc.]
- Scopes required: email, profile
- Token storage: HTTP-only cookies

## Authorization

### Access Control Model
**Type:** Role-Based Access Control (RBAC)

### Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| Admin | Full access | All operations |
| Manager | Team management | CRUD team resources |
| User | Standard access | Own resources |
| Viewer | Read-only | View assigned resources |

### Resource Permissions
| Resource | Admin | Manager | User | Viewer |
|----------|-------|---------|------|--------|
| Users | CRUD | Read | Self | - |
| Projects | CRUD | CRUD | CRU | Read |
| Settings | CRUD | Read | - | - |

### Authorization Checks
```
1. Verify authentication
2. Check resource ownership
3. Check role permissions
4. Check resource-level permissions
5. Log access attempt
```

## Data Protection

### Encryption at Rest
| Data Type | Algorithm | Key Management |
|-----------|-----------|----------------|
| Database | AES-256-GCM | AWS KMS / Vault |
| File storage | AES-256 | AWS KMS |
| Backups | AES-256 | Separate key |

### Encryption in Transit
- TLS 1.3 required
- Certificate: Let's Encrypt / ACM
- HSTS: max-age=31536000; includeSubDomains

### Sensitive Data Handling
| Data Type | Storage | Display | Logging |
|-----------|---------|---------|---------|
| Passwords | Argon2id hash | Never | Never |
| Credit cards | Tokenized | Last 4 | Never |
| SSN | Encrypted | Masked | Never |
| Email | Plain | Full | Partial |

## API Security

### Rate Limiting
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 req | 1 min |
| Auth endpoints | 10 req | 1 min |
| Authenticated | 1000 req | 1 min |

### Input Validation
- All inputs validated server-side
- Maximum request size: 10MB
- File uploads: validate type, scan for malware

### Output Encoding
- JSON: proper content-type
- HTML: context-aware encoding
- URLs: encode special characters

### CORS Policy
```
Access-Control-Allow-Origin: [specific origins]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
```

## Infrastructure Security

### Network Security
- VPC with private subnets for databases
- Security groups: principle of least privilege
- WAF for public endpoints

### Secrets Management
- Use: [AWS Secrets Manager / Vault / etc.]
- Rotation: Every 90 days
- Never in code or logs

### Container Security
- Base images: official, minimal
- No root users
- Regular vulnerability scanning

## Secure Development

### Code Security
- Static analysis (SAST) in CI
- Dependency scanning
- Code review required

### Testing
- Security unit tests
- OWASP ZAP in CI
- Annual penetration test
```

### Compliance Template
```markdown
# Compliance Requirements: [Product Name]

## Applicable Regulations

### GDPR (if EU users)
**Status:** Required

| Requirement | Implementation |
|-------------|----------------|
| Lawful basis | Consent / Contract |
| Data minimization | Only collect necessary |
| Right to access | Data export feature |
| Right to erasure | Account deletion |
| Data portability | JSON export |
| Breach notification | 72-hour process |

### CCPA (if California users)
**Status:** [Required/Not required]

### SOC 2 (if enterprise customers)
**Status:** [Planned/In progress/Certified]

### PCI DSS (if handling cards)
**Status:** [Required/Not required]
**Approach:** [Tokenization via Stripe]

## Privacy Requirements

### Privacy Policy
Must include:
- [ ] Data collected
- [ ] Purpose of collection
- [ ] Data sharing (third parties)
- [ ] Retention periods
- [ ] User rights
- [ ] Contact information

### Cookie Policy
| Cookie Type | Purpose | Consent Required |
|-------------|---------|------------------|
| Essential | Session, auth | No |
| Analytics | Usage tracking | Yes |
| Marketing | Ad targeting | Yes |

### Consent Management
- Clear consent UI
- Granular opt-in/out
- Consent records stored

## Data Retention

| Data Type | Retention | After Deletion |
|-----------|-----------|----------------|
| Account data | While active | 30 days |
| Logs | 90 days | Purged |
| Backups | 30 days | Purged |
| Analytics | 2 years | Anonymized |

## Incident Response

### Severity Levels
| Level | Definition | Response Time |
|-------|------------|---------------|
| Critical | Data breach, system down | 15 min |
| High | Security vulnerability | 1 hour |
| Medium | Service degradation | 4 hours |
| Low | Minor issues | 24 hours |

### Notification Requirements
- Users: Within 72 hours (if PII affected)
- Regulators: Within 72 hours (GDPR)
- Internal: Immediately
```

## Quality Criteria

1. **Threat Model**
   - [ ] All assets identified
   - [ ] DFD complete
   - [ ] STRIDE applied
   - [ ] Mitigations defined
   - [ ] Risks prioritized

2. **Security Requirements**
   - [ ] Auth/authz complete
   - [ ] Data protection defined
   - [ ] API security specified
   - [ ] Implementation guidance clear

3. **Compliance**
   - [ ] Applicable regulations identified
   - [ ] Privacy requirements documented
   - [ ] Retention defined

## Output Summary Format

```yaml
security_summary:
  threat_model:
    critical_risks: number
    high_risks: number
    mitigations_planned: number
  
  requirements:
    auth_type: "JWT + MFA"
    authz_model: "RBAC"
    encryption: "AES-256"
  
  compliance:
    regulations: ["GDPR", "CCPA"]
    privacy_policy_required: true
    cookie_consent_required: true
  
  documents_created:
    - path: "/docs/security/threat-model.md"
      status: "complete"
    - path: "/docs/security/security-requirements.md"
      status: "complete"
    - path: "/docs/security/policies.md"
      status: "complete"
    - path: "/docs/security/compliance.md"
      status: "complete"
```

## Как использовать в Cursor

- `/route security <задача>` — когда нужен threat modeling, security requirements, review.


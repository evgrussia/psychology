# Threat Model: «Эмоциональный баланс»

## Overview
**Date:** 2026-01-26  
**Version:** 1.0  
**Scope:** Веб-приложение психолога с интерактивными модулями, записью на консультации, оплатой, личным кабинетом и интеграцией с Telegram

## Assets

### Critical Assets
| Asset | Description | Classification | Owner |
|-------|-------------|----------------|-------|
| User credentials | Passwords, tokens, session keys | Confidential | Identity Service |
| Personal data (PII) | Email, phone, Telegram ID, display name | Confidential | Identity Service |
| Sensitive health data | Дневники, ответы анкет, результаты интерактивов | Restricted | Interactive/Booking Services |
| Payment data | Payment IDs, amounts, statuses | Restricted | Payment Service |
| Booking data | Appointments, intake forms | Confidential | Booking Service |
| Admin access | Admin credentials, audit logs | Restricted | Admin Service |

### Asset Classification
| Level | Description | Examples |
|-------|-------------|----------|
| Restricted | Highest sensitivity | Health data, payment data, admin access |
| Confidential | Sensitive personal data | PII, credentials, booking data |
| Internal | Business sensitive | Analytics, logs (без PII) |
| Public | No restrictions | Public content, marketing materials |

## System Architecture (DFD)

### Level 0: Context
```
                    ┌─────────────────────┐
    [User] ───────► │   Web Application  │ ◄───── [Admin]
    [Telegram] ────►│                    │
                    └─────────────────────┘
                            │
                            ▼
                    [External Services]
                    (ЮKassa, Google Calendar, Telegram)
```

### Level 1: Containers
```
┌─────────────────────────────────────────────────────────┐
│                    Trust Boundary                        │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Clients  │───►│ API GW   │───►│ Backend (Django) │   │
│  │ (API)    │    │ (Django) │    └────────┬─────────┘   │
│  └──────────┘    └──────────┘             │             │
│                                             ▼            │
│                                       ┌──────────┐      │
│                                       │PostgreSQL│      │
│                                       └──────────┘      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ External APIs│
                    │ (Telegram,    │
                    │  ЮKassa, GCal)│
                    └──────────────┘
```

## STRIDE Analysis

### API Gateway / Backend

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| DDoS | DoS | High | Rate limiting (Django-ratelimit), WAF (опционально), мониторинг |
| Unauthorized access | Spoofing | Critical | JWT validation, API keys для внешних интеграций, RBAC |
| Man-in-the-middle | Info Disclosure | High | TLS 1.3 only, HSTS headers |
| SQL injection | Tampering | Critical | Django ORM (parameterized queries), валидация входных данных |
| Broken access control | EoP | Critical | RBAC проверки на каждом endpoint, проверка ownership ресурсов |
| Insecure deserialization | Tampering | High | Валидация JSON, безопасные парсеры, ограничение размера запросов |
| SSRF | Info Disclosure | Medium | Валидация URL, allowlists для внешних вызовов |

### Database

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| Data breach | Info Disclosure | Critical | Encryption at rest (PostgreSQL TDE или на уровне ОС), access controls, network isolation |
| SQL injection | Tampering | Critical | Django ORM, parameterized queries, нет прямых SQL запросов |
| Unauthorized access | Spoofing | High | Network isolation (private subnet), strong authentication, принцип наименьших привилегий |
| Data loss | DoS | High | Регулярные бэкапы, тестирование восстановления |

### External Integrations

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| Telegram API compromise | Spoofing | Medium | Валидация webhook signatures, проверка Telegram user IDs |
| Payment provider compromise | Tampering | Critical | Валидация webhook signatures от ЮKassa, идемпотентность обработки, проверка сумм |
| Google Calendar sync issues | Tampering | Medium | Валидация данных от GCal API, обработка ошибок синхронизации |

### AI Agents (LangChain)

| Threat | STRIDE | Risk | Mitigation |
|--------|--------|------|------------|
| Prompt injection | Tampering | High | Input sanitization, guardrails в LangChain, валидация выходных данных |
| Data leakage | Info Disclosure | High | Не передавать чувствительные данные в LLM, использование контекстных фильтров |
| Hallucination | Tampering | Medium | Human-in-the-loop для критичных решений, валидация рекомендаций |

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
1. **RBAC и проверки доступа** — проверка прав на каждом endpoint, проверка ownership
2. **SQL Injection защита** — использование Django ORM, валидация входных данных
3. **Encryption at rest** — шифрование чувствительных данных в БД
4. **Payment webhook validation** — проверка подписей от ЮKassa

### High Priority
1. **XSS защита** — CSP headers, input sanitization, React автоматическое экранирование
2. **CSRF защита** — Django CSRF tokens, SameSite cookies
3. **Session security** — Secure cookies, короткий TTL, refresh tokens
4. **Rate limiting** — защита от DDoS и brute force
5. **TLS 1.3** — обязательное использование HTTPS

### Medium Priority
1. **Clickjacking защита** — X-Frame-Options, CSP frame-ancestors
2. **SSRF защита** — валидация URL, allowlists
3. **AI guardrails** — валидация входных/выходных данных LLM
4. **Audit logging** — логирование критичных действий админа

## Residual Risks

| Risk | Mitigation Applied | Residual Level | Acceptance |
|------|-------------------|----------------|------------|
| Data breach через уязвимость в Django | Регулярные обновления, мониторинг CVE | Low | Accepted |
| Компрометация внешнего сервиса (Telegram, ЮKassa) | Валидация webhook signatures, мониторинг аномалий | Medium | Accepted с мониторингом |
| AI hallucination в рекомендациях | Human-in-the-loop для критичных решений | Low | Accepted |

## Compliance Considerations

### 152-ФЗ (РФ)
- Минимизация персональных данных
- Явные согласия на обработку ПДн
- Право на удаление данных
- Политика конфиденциальности

### Privacy by Design
- Не храним сырые ответы интерактивов (только агрегаты)
- Не отправляем чувствительные данные в аналитику
- Self-service управление данными в ЛК

## References
- `docs/Архитектурный-обзор.md` — архитектура системы
- `docs/research/10-Legal-Privacy-Compliance-RU.md` — правовые требования
- `docs/NFR-SLO-SLI-Performance-Security-Scalability.md` — требования безопасности

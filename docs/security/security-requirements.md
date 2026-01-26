# Security Requirements: «Эмоциональный баланс»

**Версия:** 1.0  
**Дата:** 2026-01-26  
**Основано на:** Threat Model, NFR-SEC, 152-ФЗ требования

---

## 1) Authentication

### Password Requirements
| Requirement | Value |
|-------------|-------|
| Minimum length | 12 characters |
| Complexity | Upper, lower, number, special (рекомендуется) |
| History | Last 5 passwords (опционально) |
| Max age | 90 days (опционально, для админов) |
| Lockout threshold | 5 failed attempts |
| Lockout duration | 15 minutes |

### Multi-Factor Authentication
- **Required for:** Admin users (owner, assistant)
- **Methods:** TOTP (Time-based One-Time Password)
- **Recovery:** Backup codes (10 single-use)
- **Status:** Обязательно для админки в Release 1

### Session Management
| Parameter | Value |
|-----------|-------|
| Session timeout (idle) | 30 minutes |
| Session timeout (absolute) | 24 hours |
| Concurrent sessions | 5 max |
| Token type | JWT (access) + Refresh token |
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days |
| Cookie settings | HttpOnly, Secure, SameSite=Strict |

### OAuth2/OIDC (если применимо)
- **Supported providers:** Telegram (через Telegram Login Widget)
- **Scopes required:** email (если доступен), telegram user ID
- **Token storage:** HTTP-only cookies

---

## 2) Authorization

### Access Control Model
**Type:** Role-Based Access Control (RBAC)

### Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| Owner | Психолог-владелец | Все операции, включая настройки и удаление |
| Assistant | Ассистент психолога | Расписание, лиды, модерация (без доступа к чувствительным данным клиентов) |
| Editor | Контент-редактор | Контент, ресурсы, лендинги, интерактивы (тексты), без клиентских данных |
| Client | Клиент | Собственные данные, встречи, дневники, избранное |

### Resource Permissions
| Resource | Owner | Assistant | Editor | Client |
|----------|-------|-----------|--------|--------|
| Users | CRUD | Read (без P2 данных) | - | Self only |
| Appointments | CRUD | Read/Update | - | Own only |
| Payments | CRUD | Read | - | Own only |
| Content | CRUD | Read | CRUD | Read |
| Interactive Definitions | CRUD | Read | CRUD | Read |
| Interactive Runs | Read (агрегаты) | Read (агрегаты) | - | Own only |
| Diaries | Read (P2) | - | - | Own only |
| Moderation Items | CRUD | Moderate | - | Create (own) |
| Settings | CRUD | Read | - | - |

### Authorization Checks
```
1. Verify authentication (JWT valid, not expired)
2. Check resource ownership (для Client role)
3. Check role permissions (RBAC)
4. Check resource-level permissions (если применимо)
5. Log access attempt (для критичных операций)
```

---

## 3) Data Protection

### Encryption at Rest
| Data Type | Algorithm | Key Management |
|-----------|-----------|----------------|
| Database | AES-256-GCM (PostgreSQL TDE или на уровне ОС) | Отдельные ключи для БД |
| File storage | AES-256 | Отдельные ключи для медиа |
| Backups | AES-256 | Отдельный ключ для бэкапов |

### Encryption in Transit
- **TLS:** TLS 1.3 required (минимум TLS 1.2)
- **Certificate:** Let's Encrypt / ACM (автообновление)
- **HSTS:** `max-age=31536000; includeSubDomains; preload`
- **Cipher suites:** Современные, без устаревших протоколов

### Sensitive Data Handling
| Data Type | Storage | Display | Logging |
|-----------|---------|---------|---------|
| Passwords | Argon2id hash | Never | Never |
| Payment data | Tokenized (только ID от ЮKassa) | Last 4 digits (если применимо) | Never |
| Health data (P2) | Encrypted at rest | Full (для owner/client) | Never (только агрегаты) |
| Email/Phone | Plain (в БД) | Full (для owner/client) | Masked (email: u***@***.com) |
| Telegram ID | Plain (в БД) | Full (для owner/client) | Masked |

### Privacy by Design
- **Минимизация данных:** Не храним сырые ответы интерактивов (только агрегаты)
- **Аналитика:** Не отправляем P2 данные в аналитику
- **Согласия:** Раздельные согласия (ПДн/коммуникации/публикация)
- **Self-service:** Управление данными в ЛК (экспорт/удаление)

---

## 4) API Security

### Rate Limiting
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public | 100 req | 1 min |
| Auth endpoints | 10 req | 1 min |
| Authenticated | 1000 req | 1 min |
| Admin | 5000 req | 1 min |

### Input Validation
- Все входные данные валидируются server-side
- Maximum request size: 10MB
- File uploads: валидация типа, размера, сканирование на malware (опционально)
- SQL injection защита: Django ORM (parameterized queries)

### Output Encoding
- **JSON:** proper content-type (`application/json`)
- **HTML:** context-aware encoding (React автоматически экранирует)
- **URLs:** encode special characters

### CORS Policy
```
Access-Control-Allow-Origin: [specific origins]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true (для authenticated requests)
```

### Webhook Security
- **Валидация подписей:** Все webhooks от внешних сервисов (ЮKassa, Telegram) проверяются по подписи
- **Идемпотентность:** Обработка webhooks идемпотентна (по `event_id`/`payment_id`)
- **Retry logic:** Экспоненциальный backoff при ошибках

---

## 5) Infrastructure Security

### Network Security
- **VPC:** Private subnets для БД (нет прямого доступа из интернета)
- **Security groups:** Принцип наименьших привилегий
- **WAF:** Для публичных endpoints (опционально, но рекомендуется)

### Secrets Management
- **Use:** Environment variables + secrets manager (AWS Secrets Manager / Vault / аналоги)
- **Rotation:** Каждые 90 дней (или при компрометации)
- **Never in:** Коде, логах, git репозитории

### Container Security
- **Base images:** Official, minimal (Alpine/Distroless)
- **No root users:** Запуск от непривилегированного пользователя
- **Vulnerability scanning:** Регулярное сканирование образов (SCA)

### Database Security
- **Network isolation:** БД в private subnet
- **Access control:** Минимальные права для приложения (нет DROP/ALTER для production)
- **Connection encryption:** TLS для всех подключений к БД
- **Backup encryption:** Все бэкапы шифруются

---

## 6) Secure Development

### Code Security
- **Static analysis (SAST):** В CI pipeline (например, Bandit для Python)
- **Dependency scanning:** Регулярное сканирование зависимостей (safety, pip-audit)
- **Code review:** Обязательный code review для всех изменений
- **Dependency pinning:** Фиксация версий в `requirements.txt`/`poetry.lock`

### Testing
- **Security unit tests:** Тесты на валидацию, авторизацию, инъекции
- **OWASP ZAP:** В CI (опционально, для критичных endpoints)
- **Penetration testing:** Ежегодный аудит (опционально для Release 1)

### Secure Coding Practices
- **Input validation:** Всегда валидировать входные данные
- **Output encoding:** Правильное экранирование для контекста
- **Error handling:** Не раскрывать внутренние детали в ошибках
- **Logging:** Не логировать чувствительные данные (пароли, токены, P2 данные)

---

## 7) Compliance

### 152-ФЗ (РФ)
| Requirement | Implementation |
|-------------|----------------|
| Lawful basis | Consent / Contract |
| Data minimization | Только необходимые данные |
| Right to access | Экспорт данных из ЛК |
| Right to erasure | Удаление аккаунта и данных |
| Data portability | JSON export |
| Breach notification | Процесс уведомления (72 часа) |

### Privacy Policy
Должна включать:
- [ ] Какие данные собираем
- [ ] Цель сбора
- [ ] С кем делимся данными (третьи стороны)
- [ ] Сроки хранения
- [ ] Права пользователей
- [ ] Контактная информация

### Cookie Policy
| Cookie Type | Purpose | Consent Required |
|-------------|---------|-------------------|
| Essential | Session, auth | No |
| Analytics | Usage tracking | Yes |
| Marketing | Ad targeting | No (не используется) |

### Consent Management
- Чёткий UI для согласий
- Раздельные согласия (ПДн/коммуникации/публикация)
- Хранение версии текста согласия
- Возможность отзыва согласия

---

## 8) Incident Response

### Severity Levels
| Level | Definition | Response Time |
|-------|------------|---------------|
| Critical | Data breach, system down | 15 min |
| High | Security vulnerability | 1 hour |
| Medium | Service degradation | 4 hours |
| Low | Minor issues | 24 hours |

### Notification Requirements
- **Users:** В течение 72 часов (если затронуты PII)
- **Regulators:** В течение 72 часов (152-ФЗ)
- **Internal:** Немедленно

### Response Process
1. **Detection:** Мониторинг, алерты, логи
2. **Containment:** Изоляция затронутых систем
3. **Investigation:** Анализ инцидента
4. **Remediation:** Исправление уязвимости
5. **Recovery:** Восстановление сервисов
6. **Post-mortem:** Анализ и улучшения

---

## 9) Audit Logging

### Что логируем
- Критичные действия админа:
  - Изменение цен/услуг
  - Удаление данных
  - Экспорт данных
  - Изменение ролей/прав
  - Настройки оплат/интеграций
- Авторизация (успешные/неуспешные попытки)
- Изменение согласий
- Доступ к чувствительным данным (P2)

### Формат логов
- **Structured:** JSON формат
- **Fields:** timestamp, user_id, action, resource_type, resource_id, ip_address, user_agent
- **Retention:** 90 дней (hot), 1 год (cold)

### Immutability
- Логи append-only (неизменяемые)
- Защита от модификации (WORM storage или аналоги)

---

## 10) References

- `docs/security/threat-model.md` — модель угроз
- `docs/NFR-SLO-SLI-Performance-Security-Scalability.md` — NFR-SEC требования
- `docs/research/10-Legal-Privacy-Compliance-RU.md` — правовые требования
- `docs/Архитектурный-обзор.md` — архитектура системы

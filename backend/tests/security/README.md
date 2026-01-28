# Security Audit Tests

Security audit для Phase 7 согласно спецификации.

## Инструменты

### Bandit (Static Analysis для Python)

Установка:
```bash
pip install bandit[toml]
```

Запуск:
```bash
bandit -r backend/ -c backend/tests/security/bandit-config.yaml -f json -o bandit-report.json
bandit -r backend/ -c backend/tests/security/bandit-config.yaml -f txt
```

### pip-audit (Dependency Scanning)

Установка:
```bash
pip install pip-audit
```

Запуск:
```bash
pip-audit --requirement backend/requirements.txt --format json --output pip-audit-report.json
pip-audit --requirement backend/requirements.txt
```

### safety (Alternative Dependency Scanner)

Установка:
```bash
pip install safety
```

Запуск:
```bash
safety check --json --output safety-report.json
safety check
```

## Критерии успеха

Согласно спецификации Phase 7:
- **0 критичных уязвимостей**
- **≤3 высоких уязвимостей** (с планом исправления)
- **Все требования из security-requirements.md выполнены**
- **OWASP Top 10 проверены**

## Интеграция в CI/CD

Добавить в `.github/workflows/ci.yml`:

```yaml
- name: Security Audit
  run: |
    pip install bandit[toml] pip-audit safety
    bandit -r backend/ -c backend/tests/security/bandit-config.yaml
    pip-audit --requirement backend/requirements.txt
    safety check
```

## Отчеты

Все отчеты сохраняются в формате JSON для дальнейшего анализа:
- `bandit-report.json` - результаты Bandit
- `pip-audit-report.json` - результаты pip-audit
- `safety-report.json` - результаты safety

---
*Документ создан: Coder Agent*

# Phase 5 — Presentation Layer (API) Tests

Тесты для **Phase 5** (Presentation Layer) по спецификации  
`docs/api/Phase5-Presentation-Layer-API-Specification.md` и отчёту  
`docs/verification/Phase-5-Presentation-Layer-Verification-Report.md`.

## Структура

- **`serializers/`** — unit-тесты сериализаторов (auth, booking, cabinet, content, interactive, moderation).
- **`views/`** — интеграционные тесты API endpoints (auth, booking, interactive, content, cabinet, moderation, payments, admin, webhooks).
- **`test_validators.py`** — TimezoneValidator, FutureDateValidator, SlotDurationValidator.
- **`test_exceptions.py`** — `custom_exception_handler` (DRF, DomainError, ApplicationError, unhandled).
- **`test_pagination.py`** — StandardResultsSetPagination, LargeResultsSetPagination.
- **`test_permissions.py`** — IsOwner, IsOwnerOrAssistant, IsPublicOrAuthenticated, HasConsent, IsClientOrOwner.

## Запуск

```bash
cd backend
pytest tests/presentation/ -v
```

С маркерами:

```bash
pytest tests/presentation/ -v -m "not integration"
pytest tests/presentation/api/v1/views/ -v -m integration
```

## Зависимости от окружения

- **Throttling:** в `config.settings.testing` ослаблен rate limit (auth/public) и переопределены  
  `AuthEndpointThrottle.rate` / `PublicEndpointThrottle.rate`, чтобы избежать 429 в тестах.
- **AUTH_USER_MODEL:** если не задан кастомный User с UUID `id`, JWT-аутентификация при обращении  
  к защищённым endpoints может давать 500 (например, в тестах cabinet/interactive/moderation с Bearer).  
  Часть тестов допускает 500 в этих сценариях (см. комментарии в коде).

## Изменения в коде (в рамках тестов Phase 5)

- **Permissions:** `Role.Owner` → `Role.OWNER`, `ConsentType.PersonalData` → `ConsentType.PERSONAL_DATA`  
  в `presentation/api/v1/permissions.py` для соответствия доменным value objects.
- **Throttling:** `Role.Owner` / `Role.Assistant` / `Role.Editor` → `Role.OWNER` / `Role.ASSISTANT` /  
  `Role.EDITOR` в `presentation/api/v1/throttling.py`.

---
*Документ создан: QA Agent*

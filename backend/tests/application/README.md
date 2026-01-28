# Application Layer Tests

## Структура тестов

Тесты для Application Layer организованы по доменам:

- `booking/` - тесты для Use Cases бронирования (7 Use Cases)
- `content/` - тесты для Use Cases контента (3 Use Cases)
- `payments/` - тесты для Use Cases платежей (2 Use Cases)
- `interactive/` - тесты для Use Cases интерактивов (5 Use Cases)
- `client_cabinet/` - тесты для Use Cases личного кабинета (5 Use Cases)
- `admin/` - тесты для Use Cases админ-панели (6 Use Cases)
- `telegram/` - тесты для Use Cases Telegram интеграции (2 Use Cases)

## Покрытие тестами

### Текущее состояние
- ✅ **Booking Domain: 7/7 Use Cases (100%)**
  - BookAppointmentUseCase
  - ConfirmPaymentUseCase
  - CancelAppointmentUseCase
  - RescheduleAppointmentUseCase
  - RecordAppointmentOutcomeUseCase
  - GetAvailableSlotsUseCase
  - SubmitWaitlistRequestUseCase

- ✅ **Payments Domain: 2/2 Use Cases (100%)**
  - CreatePaymentIntentUseCase
  - HandlePaymentWebhookUseCase

- ✅ **Interactive Domain: 5/5 Use Cases (100%)**
  - StartInteractiveRunUseCase
  - CompleteInteractiveRunUseCase
  - AbandonInteractiveRunUseCase
  - GetBoundaryScriptsUseCase
  - GetRitualUseCase

- ✅ **Content Domain: 3/3 Use Cases (100%)**
  - GetArticleUseCase
  - ListArticlesUseCase
  - GetResourceUseCase

- ✅ **Client Cabinet Domain: 5/5 Use Cases (100%)**
  - GetClientAppointmentsUseCase
  - CreateDiaryEntryUseCase
  - DeleteDiaryEntryUseCase
  - ExportDiaryToPdfUseCase
  - DeleteUserDataUseCase

- ✅ **Admin Panel Domain: 6/6 Use Cases (100%)**
  - CreateAvailabilitySlotUseCase
  - PublishContentItemUseCase
  - ModerateUGCItemUseCase
  - AnswerUGCQuestionUseCase
  - RecordAppointmentOutcomeAdminUseCase
  - GetLeadsListUseCase

- ✅ **Telegram Integration Domain: 2/2 Use Cases (100%)**
  - HandleTelegramWebhookUseCase
  - SendTelegramPlanUseCase

**Общее покрытие:** ✅ **100% (30/30 Use Cases)**

## Структура тестов

Каждый тест включает:
- **Успешные сценарии** (happy path)
- **Ошибки валидации** (ValidationError)
- **Ошибки отсутствия ресурсов** (NotFoundError)
- **Ошибки прав доступа** (ForbiddenError)
- **Ошибки конфликтов** (ConflictError, где применимо)

## Запуск тестов

```bash
# Все тесты Application Layer
pytest backend/tests/application/

# Конкретный домен
pytest backend/tests/application/booking/

# Конкретный тест
pytest backend/tests/application/booking/test_book_appointment.py

# С покрытием
pytest backend/tests/application/ --cov=backend/application --cov-report=html
```

## Примечания

- Тесты используют моки для репозиториев и сервисов
- Event Bus использует InMemoryEventBus для изоляции
- Некоторые тесты требуют Django DB (например, GetBoundaryScriptsUseCase)
- Для полного покрытия рекомендуется добавить integration тесты

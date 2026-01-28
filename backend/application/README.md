# Application Layer - Use Cases

## Структура

Application Layer реализует Use Cases согласно спецификации Phase-4-Application-Layer-Specification.md.

### Домены

1. **Booking Domain** (`application/booking/`)
   - BookAppointmentUseCase ✅
   - ConfirmPaymentUseCase ✅
   - CancelAppointmentUseCase ✅
   - RescheduleAppointmentUseCase (требует реализации)
   - RecordAppointmentOutcomeUseCase (требует реализации)
   - GetAvailableSlotsUseCase (требует реализации)
   - SubmitWaitlistRequestUseCase (требует реализации)

2. **Payments Domain** (`application/payments/`)
   - CreatePaymentIntentUseCase (требует реализации)
   - HandlePaymentWebhookUseCase ✅

3. **Interactive Domain** (`application/interactive/`)
   - StartInteractiveRunUseCase ✅
   - CompleteInteractiveRunUseCase (требует реализации)
   - AbandonInteractiveRunUseCase (требует реализации)
   - GetBoundaryScriptsUseCase (требует реализации)
   - GetRitualUseCase (требует реализации)

4. **Content Domain** (`application/content/`)
   - GetArticleUseCase ✅
   - ListArticlesUseCase (требует реализации)
   - GetResourceUseCase (требует реализации)

5. **Client Cabinet Domain** (`application/client_cabinet/`)
   - GetClientAppointmentsUseCase (требует реализации)
   - CreateDiaryEntryUseCase ✅
   - DeleteDiaryEntryUseCase (требует реализации)
   - ExportDiaryToPdfUseCase (требует реализации)
   - DeleteUserDataUseCase (требует реализации)

6. **Admin Panel Domain** (`application/admin/`)
   - CreateAvailabilitySlotUseCase (требует реализации)
   - PublishContentItemUseCase (требует реализации)
   - ModerateUGCItemUseCase (требует реализации)
   - AnswerUGCQuestionUseCase (требует реализации)
   - RecordAppointmentOutcomeUseCase (Admin) (требует реализации)
   - GetLeadsListUseCase (требует реализации)

7. **Telegram Integration Domain** (`application/telegram/`)
   - HandleTelegramWebhookUseCase (требует реализации)
   - SendTelegramPlanUseCase (требует реализации)

## Паттерн реализации

Все use cases следуют единому паттерну:

1. **Валидация входных данных** - проверка DTO
2. **Получение агрегатов** - из репозиториев
3. **Проверка бизнес-правил** - валидация доменных правил
4. **Вызов доменной логики** - методы агрегатов
5. **Сохранение изменений** - через репозитории
6. **Публикация Domain Events** - через Event Bus
7. **Отправка уведомлений** - через внешние сервисы (если применимо)
8. **Возврат DTO** - преобразование доменных объектов в DTO

## Обработка ошибок

Все use cases используют `ApplicationError` и его подклассы:
- `NotFoundError` (404) - ресурс не найден
- `ValidationError` (422) - ошибка валидации
- `ForbiddenError` (403) - доступ запрещен
- `UnauthorizedError` (401) - не авторизован
- `ConflictError` (409) - конфликт (например, слот занят)
- `InternalError` (500) - внутренняя ошибка

## Зависимости

### Репозитории
- Domain repositories (IAppointmentRepository, IServiceRepository, etc.)
- Infrastructure repositories (если применимо)

### Domain Services
- SlotAvailabilityService
- Другие domain services

### Infrastructure Services
- EmailService
- PaymentAdapter (YooKassaAdapter)
- EncryptionService
- Event Bus (IEventBus)

## Следующие шаги

1. Реализовать оставшиеся use cases
2. Добавить unit тесты для каждого use case
3. Добавить integration тесты
4. Интегрировать с Presentation Layer (API controllers)
5. Настроить dependency injection

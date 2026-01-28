# Booking Domain Use Cases

## Реализованные Use Cases

1. **BookAppointmentUseCase** - Создание записи на консультацию
2. **ConfirmPaymentUseCase** - Подтверждение оплаты после webhook
3. **CancelAppointmentUseCase** - Отмена записи с расчётом возврата

## Оставшиеся Use Cases (требуют реализации)

4. **RescheduleAppointmentUseCase** - Перенос записи на другой слот
5. **RecordAppointmentOutcomeUseCase** - Отметка исхода встречи
6. **GetAvailableSlotsUseCase** - Получение доступных слотов
7. **SubmitWaitlistRequestUseCase** - Создание запроса в лист ожидания

## Паттерн реализации

Все use cases следуют единому паттерну:

1. Валидация входных данных
2. Получение агрегатов из репозиториев
3. Проверка бизнес-правил
4. Вызов доменной логики
5. Сохранение изменений
6. Публикация Domain Events
7. Отправка уведомлений (если применимо)
8. Возврат DTO

## Зависимости

- Репозитории (IAppointmentRepository, IServiceRepository, IUserRepository, etc.)
- Domain Services (SlotAvailabilityService)
- Infrastructure Services (EmailService, PaymentAdapter, EncryptionService)
- Event Bus (IEventBus)

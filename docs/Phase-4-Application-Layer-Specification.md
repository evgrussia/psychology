# Phase 4: Application Layer (Use Cases) — Техническая спецификация

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** ✅ Готово к реализации  
**Основано на:** Development-Phase-Plan.md, Domain-Model-Specification.md, PRD.md, User-Stories-JTBD-Acceptance-Criteria.md, api-contracts.md

---

## 1) Назначение документа

Этот документ содержит **максимально подробные технические спецификации** для всех Use Cases в Application Layer (Phase 4). Каждый Use Case описан с:
- Входными и выходными DTO
- Пошаговым алгоритмом выполнения
- Бизнес-правилами и валидацией
- Обработкой ошибок
- Domain Events
- Зависимостями (репозитории, сервисы)
- Примерами использования
- Критериями тестирования

**Архитектурный контекст:**
```
Application Layer (этот документ)
  ↓ использует
Domain Layer (Domain-Model-Specification.md)
  ↓ реализуется через
Infrastructure Layer (репозитории, интеграции)
  ↓ вызывается из
Presentation Layer (API controllers)
```

---

## 2) Структура Use Case

Каждый Use Case следует единому паттерну:

```typescript
export class [Name]UseCase {
  constructor(
    // Зависимости: репозитории, сервисы, event bus
  ) {}

  async execute(dto: [Name]Dto): Promise<[Name]ResponseDto> {
    // 1. Валидация входных данных
    // 2. Получение агрегатов из репозиториев
    // 3. Проверка бизнес-правил
    // 4. Вызов доменной логики
    // 5. Сохранение изменений
    // 6. Публикация Domain Events
    // 7. Возврат DTO
  }
}
```

---

## 3) Booking Domain — Use Cases

### 3.1 BookAppointmentUseCase

**Назначение:** Создание новой записи на консультацию (от выбора услуги до создания бронирования в статусе `pending_payment`).

**Входной DTO:**
```typescript
export class BookAppointmentDto {
  readonly serviceId: string;              // UUID услуги
  readonly slotId: string;                  // UUID слота (опционально, если создаём слот динамически)
  readonly startAt: string;                 // ISO8601, если slotId не указан
  readonly endAt: string;                   // ISO8601, если slotId не указан
  readonly timezone: string;                // IANA timezone (например, "Europe/Moscow")
  readonly format: 'online' | 'offline';    // Формат консультации
  readonly userId: string | null;           // UUID пользователя (null для гостя)
  readonly anonymousId: string | null;      // Анонимный ID (если userId = null)
  readonly intakeForm?: {                   // Опциональная анкета
    [key: string]: string | number | boolean;
  };
  readonly consents: {                      // Согласия
    personalData: boolean;                  // Обязательно true
    communications?: boolean;               // Опционально
  };
  readonly metadata: {                      // Метаданные для аналитики
    entryPoint: string;                     // 'home' | 'topic_landing' | 'quiz_result' | 'article'
    topicCode?: string;                     // Код темы (если применимо)
    deepLinkId?: string;                    // ID для склейки аналитики
    utmParams?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
  };
}
```

**Выходной DTO:**
```typescript
export class AppointmentResponseDto {
  readonly id: string;
  readonly service: {
    id: string;
    slug: string;
    title: string;
    durationMinutes: number;
  };
  readonly slot: {
    id: string;
    startAt: string;                        // ISO8601
    endAt: string;                          // ISO8601
    timezone: string;
  };
  readonly status: 'pending_payment' | 'confirmed' | 'canceled';
  readonly format: 'online' | 'offline';
  readonly payment?: {
    id: string;
    amount: number;                         // RUB
    depositAmount?: number;                  // RUB
    paymentUrl: string;                     // URL для оплаты (ЮKassa)
    status: 'intent' | 'pending' | 'succeeded' | 'failed';
  };
  readonly createdAt: string;               // ISO8601
}
```

**Алгоритм выполнения:**

1. **Валидация входных данных:**
   - `serviceId` обязателен и валидный UUID
   - Либо `slotId`, либо `startAt` + `endAt` + `timezone` должны быть указаны
   - `consents.personalData` должен быть `true`
   - `timezone` валидная IANA timezone
   - `format` соответствует допустимым значениям

2. **Получение агрегатов:**
   - Получить `Service` из `IServiceRepository.findById(serviceId)`
   - Если не найден → `ApplicationError('Service not found', 404)`
   - Если `userId` указан:
     - Получить `User` из `IUserRepository.findById(userId)`
     - Если не найден → `ApplicationError('User not found', 404)`
     - Проверить `user.hasActiveConsent(ConsentType.PersonalData)`
     - Если нет → `ApplicationError('Personal data consent is required', 403)`
   - Если `slotId` указан:
     - Получить слот из `IAvailabilitySlotRepository.findById(slotId)`
     - Если не найден → `ApplicationError('Slot not found', 404)`
     - Создать `TimeSlot` из данных слота
   - Иначе:
     - Создать `TimeSlot` из `startAt`, `endAt`, `timezone`
     - Проверить доступность через `SlotAvailabilityService.isSlotAvailable()`

3. **Проверка бизнес-правил:**
   - `TimeSlot.isInPast()` → `ApplicationError('Cannot book appointment in the past', 400)`
   - `Service.isAvailableFor(format)` → `ApplicationError('Service does not support this format', 400)`
   - Проверить конфликты через `SlotAvailabilityService.isSlotAvailable(slot, serviceId)`
   - Если слот недоступен → `ApplicationError('Slot is not available', 409)`

4. **Создание агрегата:**
   - Создать `BookingMetadata` из `metadata`
   - Создать `AppointmentFormat` из `format`
   - Вызвать `Appointment.create(service, clientId, slot, format, metadata)`
   - Если `intakeForm` указан:
     - Зашифровать через `IEncryptionService.encrypt(JSON.stringify(intakeForm))`
     - Создать `IntakeForm` и прикрепить: `appointment.attachIntakeForm(intakeForm)`

5. **Создание платежа:**
   - Создать `PaymentIntent` через `IPaymentService.createIntent(appointment, service)`
   - Получить `paymentUrl` от провайдера (ЮKassa)
   - Присвоить `appointment.payment = payment`

6. **Сохранение:**
   - Сохранить `Appointment` через `IAppointmentRepository.saveWithConflictCheck(appointment)`
   - Если `ConflictError` → `ApplicationError('Slot conflict detected', 409)`

7. **Публикация событий:**
   - Получить Domain Events: `appointment.getDomainEvents()`
   - Опубликовать через `IEventBus.publish(events)`
   - Очистить: `appointment.clearDomainEvents()`

8. **Создание/обновление Lead (если применимо):**
   - Если `metadata.deepLinkId` указан:
     - Найти или создать `Lead` через `ILeadRepository.findByDeepLinkId(deepLinkId)`
     - Добавить событие: `Lead.addTimelineEvent(new TimelineEvent('booking_start', ...))`
     - Сохранить `Lead`

9. **Возврат DTO:**
   - Маппинг `Appointment` → `AppointmentResponseDto`

**Обработка ошибок:**

| Ошибка | HTTP Code | Сообщение |
|--------|-----------|-----------|
| Service not found | 404 | Service not found |
| User not found | 404 | User not found |
| Personal data consent required | 403 | Personal data consent is required |
| Slot not found | 404 | Slot not found |
| Cannot book in past | 400 | Cannot book appointment in the past |
| Service format mismatch | 400 | Service does not support this format |
| Slot not available | 409 | Slot is not available |
| Slot conflict | 409 | Slot conflict detected. Please choose another slot. |
| Invalid timezone | 400 | Invalid timezone format |
| Validation error | 422 | Validation failed: {details} |

**Domain Events:**
- `AppointmentCreatedEvent` (публикуется автоматически при создании)

**Зависимости:**
```typescript
constructor(
  private readonly appointmentRepository: IAppointmentRepository,
  private readonly serviceRepository: IServiceRepository,
  private readonly userRepository: IUserRepository,
  private readonly availabilitySlotRepository: IAvailabilitySlotRepository,
  private readonly slotAvailabilityService: SlotAvailabilityService,
  private readonly paymentService: IPaymentService,
  private readonly encryptionService: IEncryptionService,
  private readonly leadRepository: ILeadRepository,
  private readonly eventBus: IEventBus
) {}
```

**Пример использования:**
```typescript
const useCase = new BookAppointmentUseCase(...);
const dto = new BookAppointmentDto({
  serviceId: 'uuid',
  slotId: 'slot-uuid',
  timezone: 'Europe/Moscow',
  format: 'online',
  userId: 'user-uuid',
  consents: { personalData: true, communications: true },
  metadata: {
    entryPoint: 'topic_landing',
    topicCode: 'anxiety',
    deepLinkId: 'abc123'
  }
});
const result = await useCase.execute(dto);
```

**Тесты:**
- ✅ Успешное создание записи
- ✅ Ошибка: услуга не найдена
- ✅ Ошибка: слот в прошлом
- ✅ Ошибка: конфликт слотов
- ✅ Ошибка: нет согласия на ПДн
- ✅ Создание с анкетой
- ✅ Создание без пользователя (анонимно)
- ✅ Публикация Domain Events
- ✅ Создание/обновление Lead

---

### 3.2 ConfirmPaymentUseCase

**Назначение:** Подтверждение оплаты после получения webhook от ЮKassa.

**Входной DTO:**
```typescript
export class ConfirmPaymentDto {
  readonly appointmentId: string;           // UUID записи
  readonly paymentData: {                   // Данные от webhook ЮKassa
    providerPaymentId: string;
    amount: number;                         // RUB
    status: 'succeeded' | 'failed' | 'canceled';
    failureReason?: string;
  };
}
```

**Выходной DTO:**
```typescript
export class ConfirmPaymentResponseDto {
  readonly appointmentId: string;
  readonly status: 'confirmed' | 'failed';
  readonly payment: {
    id: string;
    status: 'succeeded' | 'failed';
  };
}
```

**Алгоритм выполнения:**

1. **Получение агрегата:**
   - Получить `Appointment` из `IAppointmentRepository.findById(appointmentId)`
   - Если не найден → `ApplicationError('Appointment not found', 404)`
   - Получить `Service` из `IServiceRepository.findById(appointment.serviceId)`

2. **Создание Payment:**
   - Создать `Payment` из webhook данных:
     ```typescript
     const payment = Payment.create(
       new Money(paymentData.amount, Currency.RUB),
       PaymentProvider.YooKassa,
       paymentData.providerPaymentId
     );
     ```
   - Если `paymentData.status === 'succeeded'`:
     - `payment.markAsSucceeded()`
   - Иначе:
     - `payment.markAsFailed(paymentData.failureReason || 'Payment failed')`

3. **Подтверждение записи:**
   - Если оплата успешна:
     - Вызвать `appointment.confirmPayment(payment, service)`
   - Иначе:
     - Обновить статус платежа в `appointment`

4. **Сохранение:**
   - Сохранить `Appointment` через `IAppointmentRepository.save(appointment)`

5. **Публикация событий:**
   - Публиковать `AppointmentConfirmedEvent` или `PaymentFailedEvent`

6. **Отправка уведомлений:**
   - Если подтверждено:
     - Отправить email через `IEmailService.sendAppointmentConfirmation(appointment)`
     - Запланировать напоминания через `INotificationService.scheduleReminders(appointment)`

7. **Обновление Lead:**
   - Если `appointment.metadata.deepLinkId` указан:
     - Обновить `Lead`: `Lead.moveToConverted()`
     - Добавить событие: `Lead.addTimelineEvent(new TimelineEvent('booking_confirmed', ...))`

**Обработка ошибок:**
- Appointment not found → 404
- Payment amount mismatch → 400
- Appointment already confirmed → 409

**Domain Events:**
- `AppointmentConfirmedEvent` (при успехе)
- `PaymentFailedEvent` (при ошибке)

---

### 3.3 CancelAppointmentUseCase

**Назначение:** Отмена записи с расчётом возврата средств.

**Входной DTO:**
```typescript
export class CancelAppointmentDto {
  readonly appointmentId: string;
  readonly userId: string;                  // Для проверки прав
  readonly reason: 'client_request' | 'provider_request' | 'other';
  readonly reasonDetails?: string;          // Опционально
}
```

**Выходной DTO:**
```typescript
export class CancelAppointmentResponseDto {
  readonly appointmentId: string;
  readonly status: 'canceled';
  readonly refundAmount: number | null;     // RUB, null если возврат не предусмотрен
  readonly refundStatus: 'full' | 'partial' | 'none';
}
```

**Алгоритм выполнения:**

1. **Проверка прав:**
   - Получить `Appointment` и проверить, что `appointment.clientId === userId` или пользователь имеет роль `admin`

2. **Проверка возможности отмены:**
   - Вызвать `appointment.canBeCanceled()` (доменная логика)
   - Если нет → `ApplicationError('Appointment cannot be canceled', 400)`

3. **Расчёт возврата:**
   - Получить `Service`
   - Вызвать `appointment.cancel(reason, service)`
   - Получить `refundAmount` из результата

4. **Инициация возврата (если применимо):**
   - Если `refundAmount > 0`:
     - Создать refund через `IPaymentService.createRefund(appointment.payment, refundAmount)`

5. **Сохранение:**
   - Сохранить `Appointment`

6. **Публикация событий:**
   - `AppointmentCanceledEvent`

7. **Уведомления:**
   - Отправить email о отмене

**Обработка ошибок:**
- Appointment not found → 404
- Forbidden (не владелец) → 403
- Cannot cancel → 400

**Domain Events:**
- `AppointmentCanceledEvent`

---

### 3.4 RescheduleAppointmentUseCase

**Назначение:** Перенос записи на другой слот.

**Входной DTO:**
```typescript
export class RescheduleAppointmentDto {
  readonly appointmentId: string;
  readonly userId: string;
  readonly newSlotId: string;               // Или newStartAt + newEndAt + timezone
  readonly newStartAt?: string;
  readonly newEndAt?: string;
  readonly timezone?: string;
}
```

**Алгоритм выполнения:**

1. **Получение агрегатов:**
   - Получить `Appointment` и `Service`

2. **Проверка возможности переноса:**
   - Вызвать `appointment.canBeRescheduled(service)` (доменная логика)
   - Если нет → `ApplicationError('Appointment cannot be rescheduled', 400)`

3. **Создание нового TimeSlot:**
   - Если `newSlotId` указан → получить слот
   - Иначе → создать из `newStartAt`, `newEndAt`, `timezone`

4. **Проверка доступности:**
   - Проверить через `SlotAvailabilityService.isSlotAvailable(newSlot, serviceId)`

5. **Перенос:**
   - Вызвать `appointment.reschedule(newSlot, service)`

6. **Сохранение и события:**
   - Сохранить, опубликовать `AppointmentRescheduledEvent`, отправить уведомления

**Domain Events:**
- `AppointmentRescheduledEvent`

---

### 3.5 RecordAppointmentOutcomeUseCase

**Назначение:** Отметка исхода встречи (attended/no-show/canceled).

**Входной DTO:**
```typescript
export class RecordAppointmentOutcomeDto {
  readonly appointmentId: string;
  readonly outcome: 'attended' | 'no_show' | 'canceled_by_client' | 'canceled_by_provider' | 'rescheduled';
  readonly notes?: string;                   // Опционально, для админа
}
```

**Алгоритм выполнения:**

1. **Получение агрегата:**
   - Получить `Appointment`
   - Проверить, что встреча уже прошла: `appointment.timeSlot.isInPast()`

2. **Создание OutcomeRecord:**
   - Создать `AppointmentOutcome` из `outcome`
   - Вызвать `appointment.recordOutcome(outcome)`

3. **Сохранение и события:**
   - Сохранить, опубликовать `AppointmentNoShowEvent` (если применимо)

**Domain Events:**
- `AppointmentNoShowEvent` (если `outcome === 'no_show'`)

---

### 3.6 GetAvailableSlotsUseCase

**Назначение:** Получение доступных слотов для услуги.

**Входной DTO:**
```typescript
export class GetAvailableSlotsDto {
  readonly serviceId: string;
  readonly dateFrom: string;                // ISO8601
  readonly dateTo: string;                  // ISO8601
  readonly timezone: string;                // IANA timezone
}
```

**Выходной DTO:**
```typescript
export class AvailableSlotDto {
  readonly id: string;
  readonly startAt: string;                  // ISO8601 в UTC
  readonly endAt: string;                   // ISO8601 в UTC
  readonly status: 'available' | 'reserved' | 'blocked';
  readonly localStartAt: string;            // ISO8601 в таймзоне пользователя
  readonly localEndAt: string;              // ISO8601 в таймзоне пользователя
}
```

**Алгоритм выполнения:**

1. **Получение слотов:**
   - Получить слоты из `IAvailabilitySlotRepository.findAvailableSlots(serviceId, dateFrom, dateTo)`

2. **Фильтрация конфликтов:**
   - Получить занятые записи через `IAppointmentRepository.findConflictingAppointments(slots)`
   - Исключить конфликтующие слоты

3. **Конвертация таймзон:**
   - Конвертировать каждый слот в таймзону пользователя

4. **Возврат DTO:**
   - Маппинг в `AvailableSlotDto[]`

---

### 3.7 SubmitWaitlistRequestUseCase

**Назначение:** Создание запроса в лист ожидания.

**Входной DTO:**
```typescript
export class SubmitWaitlistRequestDto {
  readonly serviceId: string;
  readonly contactInfo: {
    preferredMethod: 'email' | 'phone' | 'telegram';
    value: string;                          // Зашифруется
  };
  readonly preferredTimeWindow?: string;    // Опционально: "morning" | "afternoon" | "evening" | "weekend"
  readonly userId?: string;                  // Если авторизован
  readonly consents: {
    communications: boolean;                // Обязательно для waitlist
  };
}
```

**Алгоритм выполнения:**

1. **Шифрование контакта:**
   - Зашифровать `contactInfo.value` через `IEncryptionService.encrypt()`

2. **Создание агрегата:**
   - Создать `WaitlistRequest` через `WaitlistRequest.create(serviceId, encryptedContact, preferredTimeWindow)`

3. **Сохранение:**
   - Сохранить через `IWaitlistRequestRepository.save(waitlistRequest)`

4. **Создание/обновление Lead:**
   - Если `userId` или `deepLinkId` указан:
     - Обновить `Lead`: добавить событие `waitlist_submitted`

5. **Уведомление админа:**
   - Отправить уведомление через `INotificationService.notifyAdminNewWaitlistRequest(waitlistRequest)`

**Domain Events:**
- `WaitlistRequestCreatedEvent`

---

## 4) Payments Domain — Use Cases

### 4.1 CreatePaymentIntentUseCase

**Назначение:** Создание намерения оплаты (Payment Intent) для записи.

**Входной DTO:**
```typescript
export class CreatePaymentIntentDto {
  readonly appointmentId: string;
  readonly amount: number;                  // RUB
  readonly depositAmount?: number;          // RUB, если депозит
}
```

**Выходной DTO:**
```typescript
export class PaymentIntentResponseDto {
  readonly paymentId: string;
  readonly paymentUrl: string;              // URL для редиректа на оплату
  readonly amount: number;
  readonly status: 'intent' | 'pending';
}
```

**Алгоритм выполнения:**

1. **Получение агрегата:**
   - Получить `Appointment` и `Service`

2. **Создание Payment Intent:**
   - Вызвать `IPaymentService.createIntent(appointment, amount, depositAmount)`
   - Получить `paymentUrl` от провайдера (ЮKassa)

3. **Создание Payment агрегата:**
   - Создать `Payment` через `Payment.createIntent(appointmentId, amount, PaymentProvider.YooKassa)`
   - Присвоить `providerPaymentId` после создания в провайдере

4. **Сохранение:**
   - Сохранить `Payment` через `IPaymentRepository.save(payment)`
   - Обновить `Appointment` с привязкой к платежу

5. **Публикация событий:**
   - `PaymentIntentCreatedEvent`

**Domain Events:**
- `PaymentIntentCreatedEvent`

---

### 4.2 HandlePaymentWebhookUseCase

**Назначение:** Обработка webhook от ЮKassa о статусе платежа.

**Входной DTO:**
```typescript
export class PaymentWebhookDto {
  readonly providerPaymentId: string;
  readonly event: 'payment.succeeded' | 'payment.canceled' | 'payment.waiting_for_capture';
  readonly amount: {
    value: number;
    currency: string;
  };
  readonly metadata?: {
    appointmentId?: string;
  };
}
```

**Алгоритм выполнения:**

1. **Валидация подписи:**
   - Проверить подпись webhook через `IPaymentService.verifyWebhookSignature(webhookData, signature)`
   - Если невалидна → `ApplicationError('Invalid webhook signature', 401)`

2. **Идемпотентность:**
   - Проверить, не обработан ли уже этот webhook (по `providerPaymentId` + `event`)
   - Если обработан → вернуть успех (идемпотентность)

3. **Поиск платежа:**
   - Найти `Payment` по `providerPaymentId`
   - Если не найден → `ApplicationError('Payment not found', 404)`

4. **Обновление статуса:**
   - Если `event === 'payment.succeeded'`:
     - Вызвать `payment.confirmSuccess()`
   - Если `event === 'payment.canceled'`:
     - Вызвать `payment.cancel()`
   - Если `event === 'payment.waiting_for_capture'`:
     - Обновить статус на `pending`

5. **Подтверждение записи (если применимо):**
   - Если платеж успешен и есть `appointmentId`:
     - Вызвать `ConfirmPaymentUseCase.execute({ appointmentId, paymentData })`

6. **Сохранение:**
   - Сохранить `Payment`

7. **Публикация событий:**
   - `PaymentSucceededEvent` или `PaymentFailedEvent`

**Обработка ошибок:**
- Invalid signature → 401
- Payment not found → 404
- Duplicate webhook → 200 (идемпотентность)

**Domain Events:**
- `PaymentSucceededEvent`
- `PaymentFailedEvent`
- `PaymentCanceledEvent`

---

## 5) Interactive Domain — Use Cases

### 5.1 StartInteractiveRunUseCase

**Назначение:** Начало прохождения интерактива (квиз/навигатор/термометр).

**Входной DTO:**
```typescript
export class StartInteractiveRunDto {
  readonly interactiveSlug: string;          // slug интерактива
  readonly userId?: string;                 // Опционально
  readonly anonymousId?: string;            // Если userId не указан
  readonly metadata: {
    entryPoint: string;                     // 'home' | 'topic_landing' | 'article'
    topicCode?: string;
    deepLinkId?: string;
  };
}
```

**Выходной DTO:**
```typescript
export class InteractiveRunResponseDto {
  readonly runId: string;
  readonly interactive: {
    id: string;
    slug: string;
    title: string;
    type: 'quiz' | 'navigator' | 'thermometer' | 'boundaries_scripts' | 'ritual' | 'consultation_prep';
  };
  readonly questions?: QuestionDto[];       // Для квизов
  readonly steps?: NavigatorStepDto[];     // Для навигатора
  readonly startedAt: string;               // ISO8601
}
```

**Алгоритм выполнения:**

1. **Получение определения интерактива:**
   - Получить `InteractiveDefinition` из `IInteractiveDefinitionRepository.findBySlug(interactiveSlug)`
   - Если не найден → `ApplicationError('Interactive not found', 404)`
   - Проверить, что интерактив опубликован: `definition.isPublished()`

2. **Создание Run:**
   - Создать `InteractiveRun` через `InteractiveRun.start(definitionId, userId, anonymousId, metadata)`

3. **Сохранение:**
   - Сохранить через `IInteractiveRunRepository.save(run)`

4. **Публикация событий:**
   - `InteractiveRunStartedEvent`

5. **Создание/обновление Lead:**
   - Если `metadata.deepLinkId` указан:
     - Обновить `Lead`: добавить событие `interactive_started`

6. **Возврат DTO:**
   - Маппинг в `InteractiveRunResponseDto` с вопросами/шагами из определения

**Domain Events:**
- `InteractiveRunStartedEvent`

---

### 5.2 CompleteInteractiveRunUseCase

**Назначение:** Завершение прохождения интерактива с результатом.

**Входной DTO:**
```typescript
export class CompleteInteractiveRunDto {
  readonly runId: string;
  readonly answers?: {                      // Для квизов
    questionId: string;
    value: string | number;
  }[];
  readonly navigatorPath?: string[];        // Для навигатора: массив выбранных вариантов
  readonly thermometerValues?: {            // Для термометра
    energy: number;                          // 1-10
    tension: number;                          // 1-10
    support: number;                          // 1-10
  };
  readonly crisisTriggered?: boolean;        // Если обнаружен кризисный триггер
}
```

**Выходной DTO:**
```typescript
export class InteractiveResultResponseDto {
  readonly runId: string;
  readonly result: {
    level: 'low' | 'moderate' | 'high';
    profile?: string;                        // Для навигатора
    recommendations: {
      now: string[];                         // 2-3 шага "сейчас"
      week: string[];                        // 2-3 шага "на неделю"
    };
    whenToSeekHelp?: string;                 // Если level === 'high'
  };
  readonly crisisTriggered: boolean;
  readonly deepLinkId: string;              // Для склейки аналитики
}
```

**Алгоритм выполнения:**

1. **Получение Run:**
   - Получить `InteractiveRun` из `IInteractiveRunRepository.findById(runId)`
   - Если не найден → `ApplicationError('Run not found', 404)`
   - Проверить статус: `run.status.isInProgress()`

2. **Расчёт результата:**
   - Получить `InteractiveDefinition`
   - Вычислить результат на основе `answers`/`navigatorPath`/`thermometerValues`:
     - Для квиза: суммировать баллы, определить уровень по порогам
     - Для навигатора: пройти по ветвям, определить профиль
     - Для термометра: вычислить `resource_level` по значениям шкал
   - Создать `InteractiveResult`:
     ```typescript
     const result = new InteractiveResult(
       ResultLevel.fromScore(score),        // или из логики навигатора
       profile,                              // для навигатора
       crisisTriggered || false
     );
     ```

3. **Завершение Run:**
   - Вызвать `run.complete(result)`

4. **Сохранение:**
   - Сохранить `InteractiveRun`

5. **Публикация событий:**
   - `InteractiveRunCompletedEvent`
   - Если `crisisTriggered` → `CrisisTriggeredEvent`

6. **Обновление Lead:**
   - Если `run.metadata.deepLinkId` указан:
     - Обновить `Lead`: добавить событие `interactive_completed` с `result.level` (без сырых ответов)

7. **Возврат DTO:**
   - Маппинг в `InteractiveResultResponseDto`

**Важно:** Сырые ответы (`answers`, `navigatorPath`, `thermometerValues`) **не сохраняются** в БД. Сохраняется только агрегированный результат (`level`, `profile`).

**Domain Events:**
- `InteractiveRunCompletedEvent`
- `CrisisTriggeredEvent` (если применимо)

---

### 5.3 AbandonInteractiveRunUseCase

**Назначение:** Отметка незавершённого прохождения (abandonment).

**Входной DTO:**
```typescript
export class AbandonInteractiveRunDto {
  readonly runId: string;
}
```

**Алгоритм выполнения:**

1. **Получение Run:**
   - Получить `InteractiveRun`

2. **Отметка как abandoned:**
   - Вызвать `run.abandon()`

3. **Сохранение и события:**
   - Сохранить, опубликовать `InteractiveRunAbandonedEvent`

**Domain Events:**
- `InteractiveRunAbandonedEvent`

---

### 5.4 GetBoundaryScriptsUseCase

**Назначение:** Получение скриптов границ по выбранным параметрам.

**Входной DTO:**
```typescript
export class GetBoundaryScriptsDto {
  readonly scenario: 'work' | 'family' | 'partner' | 'friends';
  readonly style: 'soft' | 'brief' | 'firm';
  readonly goal: 'refuse' | 'ask' | 'set_rule' | 'pause';
}
```

**Выходной DTO:**
```typescript
export class BoundaryScriptsResponseDto {
  readonly scripts: {
    id: string;                              // variant_id (для аналитики)
    text: string;                            // Текст фразы (не в аналитику!)
    scenario: string;
    style: string;
    goal: string;
  }[];
  readonly safetyTips: string[];            // "Что делать, если давят"
}
```

**Алгоритм выполнения:**

1. **Получение скриптов:**
   - Получить скрипты из `IBoundaryScriptsRepository.findByCriteria(scenario, style, goal)`
   - Получить safety tips из конфигурации

2. **Возврат DTO:**
   - Маппинг в `BoundaryScriptsResponseDto`

**Важно:** Текст скриптов (`text`) **не отправляется в аналитику**. Отправляется только `variant_id`.

---

### 5.5 GetRitualUseCase

**Назначение:** Получение мини-ритуала для прохождения.

**Входной DTO:**
```typescript
export class GetRitualDto {
  readonly ritualId: string;                // Или slug
}
```

**Выходной DTO:**
```typescript
export class RitualResponseDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly durationMinutes: number;
  readonly instructions: string[];           // Пошаговые инструкции
  readonly audioUrl?: string;                // Если есть аудио
}
```

**Алгоритм выполнения:**

1. **Получение ритуала:**
   - Получить из `IRitualRepository.findById(ritualId)`

2. **Возврат DTO:**
   - Маппинг в `RitualResponseDto`

---

## 6) Content Domain — Use Cases

### 6.1 GetArticleUseCase

**Назначение:** Получение статьи по slug.

**Входной DTO:**
```typescript
export class GetArticleDto {
  readonly slug: string;
  readonly includeDraft?: boolean;          // Только для админа
}
```

**Выходной DTO:**
```typescript
export class ArticleResponseDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly content: string;                 // Markdown
  readonly excerpt: string;
  readonly publishedAt: string;             // ISO8601
  readonly category: string;
  readonly tags: string[];
  readonly relatedResources?: ResourceDto[];
  readonly ctaBlocks?: {
    type: 'exercise' | 'quiz' | 'booking';
    targetId: string;
    text: string;
  }[];
}
```

**Алгоритм выполнения:**

1. **Получение статьи:**
   - Получить из `IArticleRepository.findBySlug(slug)`
   - Проверить статус: если не опубликована и не админ → 404

2. **Получение связанных ресурсов:**
   - Получить связанные ресурсы/упражнения через `IContentRepository.findRelatedResources(articleId)`

3. **Возврат DTO:**
   - Маппинг в `ArticleResponseDto`

---

### 6.2 ListArticlesUseCase

**Назначение:** Список статей с пагинацией и фильтрами.

**Входной DTO:**
```typescript
export class ListArticlesDto {
  readonly page?: number;                   // Default: 1
  readonly perPage?: number;               // Default: 20, max: 100
  readonly category?: string;
  readonly tag?: string;
  readonly search?: string;
}
```

**Выходной DTO:**
```typescript
export class ArticlesListResponseDto {
  readonly data: ArticleListItemDto[];
  readonly pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
```

---

### 6.3 GetResourceUseCase

**Назначение:** Получение ресурса (упражнение/аудио/чек-лист).

**Входной DTO:**
```typescript
export class GetResourceDto {
  readonly slug: string;
}
```

**Выходной DTO:**
```typescript
export class ResourceResponseDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly type: 'exercise' | 'audio' | 'checklist' | 'pdf';
  readonly content: string;                 // Markdown или инструкции
  readonly durationMinutes?: number;
  readonly audioUrl?: string;
  readonly pdfUrl?: string;
  readonly relatedArticles?: ArticleListItemDto[];
}
```

---

## 7) Client Cabinet Domain — Use Cases

### 7.1 GetClientAppointmentsUseCase

**Назначение:** Получение списка встреч клиента.

**Входной DTO:**
```typescript
export class GetClientAppointmentsDto {
  readonly userId: string;
  readonly status?: 'upcoming' | 'past' | 'all';
  readonly limit?: number;
}
```

**Выходной DTO:**
```typescript
export class ClientAppointmentsResponseDto {
  readonly appointments: {
    id: string;
    service: {
      title: string;
      durationMinutes: number;
    };
    slot: {
      startAt: string;                      // ISO8601
      endAt: string;
      timezone: string;
    };
    status: string;
    format: 'online' | 'offline';
  }[];
}
```

**Алгоритм выполнения:**

1. **Проверка прав:**
   - Проверить, что `userId` соответствует текущему пользователю

2. **Получение записей:**
   - Получить через `IAppointmentRepository.findByClientId(userId, status)`

3. **Возврат DTO:**
   - Маппинг в `ClientAppointmentsResponseDto`

---

### 7.2 CreateDiaryEntryUseCase

**Назначение:** Создание записи дневника.

**Входной DTO:**
```typescript
export class CreateDiaryEntryDto {
  readonly userId: string;
  readonly type: 'emotion' | 'abc';        // ABC = Activating event, Belief, Consequence
  readonly content: {
    emotion?: string;                        // Для типа 'emotion'
    intensity?: number;                       // 1-10
    activatingEvent?: string;                // Для типа 'abc'
    belief?: string;
    consequence?: string;
  };
}
```

**Выходной DTO:**
```typescript
export class DiaryEntryResponseDto {
  readonly id: string;
  readonly type: string;
  readonly content: object;
  readonly createdAt: string;               // ISO8601
}
```

**Алгоритм выполнения:**

1. **Шифрование контента:**
   - Зашифровать `content` через `IEncryptionService.encrypt(JSON.stringify(content))`

2. **Создание записи:**
   - Создать `DiaryEntry` через доменную модель

3. **Сохранение:**
   - Сохранить через `IDiaryEntryRepository.save(entry)`

4. **Возврат DTO:**
   - Маппинг в `DiaryEntryResponseDto`

**Важно:** Контент дневника шифруется (P2 данные).

---

### 7.3 DeleteDiaryEntryUseCase

**Назначение:** Удаление записи дневника.

**Входной DTO:**
```typescript
export class DeleteDiaryEntryDto {
  readonly entryId: string;
  readonly userId: string;
}
```

**Алгоритм выполнения:**

1. **Проверка прав:**
   - Получить запись и проверить, что она принадлежит `userId`

2. **Удаление:**
   - Удалить через `IDiaryEntryRepository.delete(entryId)`

---

### 7.4 ExportDiaryToPdfUseCase

**Назначение:** Экспорт дневников в PDF.

**Входной DTO:**
```typescript
export class ExportDiaryToPdfDto {
  readonly userId: string;
  readonly dateFrom: string;                // ISO8601
  readonly dateTo: string;                  // ISO8601
  readonly format: 'pdf';
}
```

**Выходной DTO:**
```typescript
export class ExportDiaryResponseDto {
  readonly exportId: string;
  readonly status: 'processing' | 'ready' | 'failed';
  readonly downloadUrl?: string;            // Когда status === 'ready'
  readonly expiresAt?: string;             // ISO8601
}
```

**Алгоритм выполнения:**

1. **Получение записей:**
   - Получить записи за период через `IDiaryEntryRepository.findByUserIdAndDateRange(userId, dateFrom, dateTo)`

2. **Расшифровка:**
   - Расшифровать каждую запись через `IEncryptionService.decrypt()`

3. **Генерация PDF:**
   - Создать PDF через `IPdfGeneratorService.generateDiaryPdf(entries)`
   - Загрузить в хранилище (S3 или локальное)

4. **Создание Export Job:**
   - Сохранить метаданные экспорта

5. **Возврат DTO:**
   - Вернуть `exportId` и статус `processing`

**Примечание:** Экспорт выполняется асинхронно. Статус проверяется через `GetDiaryExportStatusUseCase`.

---

### 7.5 DeleteUserDataUseCase

**Назначение:** Удаление всех данных пользователя (GDPR/152-ФЗ).

**Входной DTO:**
```typescript
export class DeleteUserDataDto {
  readonly userId: string;
  readonly confirmation: string;          // "DELETE" для подтверждения
}
```

**Алгоритм выполнения:**

1. **Проверка подтверждения:**
   - Проверить, что `confirmation === 'DELETE'`

2. **Анонимизация данных:**
   - Анонимизировать записи: удалить связь с `userId`, оставить только агрегированные данные
   - Удалить дневники (или анонимизировать)
   - Удалить анкеты (или анонимизировать)

3. **Обновление User:**
   - Вызвать `user.delete()` (доменная логика)

4. **Сохранение:**
   - Сохранить изменения

5. **Публикация событий:**
   - `UserDataDeletedEvent`

**Важно:** Полное удаление может быть ограничено юридическими требованиями (например, хранение финансовых данных). В таких случаях данные анонимизируются.

**Domain Events:**
- `UserDataDeletedEvent`

---

## 8) Admin Panel Domain — Use Cases

### 8.1 CreateAvailabilitySlotUseCase

**Назначение:** Создание слота доступности.

**Входной DTO:**
```typescript
export class CreateAvailabilitySlotDto {
  readonly serviceId?: string;              // Опционально (для конкретной услуги)
  readonly startAt: string;                 // ISO8601
  readonly endAt: string;                  // ISO8601
  readonly timezone: string;               // IANA
  readonly recurrence?: {                   // Опционально: повторение
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;                       // Каждые N дней/недель/месяцев
    endDate?: string;                       // ISO8601, когда закончить
  };
}
```

**Алгоритм выполнения:**

1. **Создание слотов:**
   - Если `recurrence` указан:
     - Сгенерировать серию слотов
   - Иначе:
     - Создать один слот

2. **Сохранение:**
   - Сохранить через `IAvailabilitySlotRepository.save(slots)`

---

### 8.2 PublishContentItemUseCase

**Назначение:** Публикация контента с проверкой чеклиста.

**Входной DTO:**
```typescript
export class PublishContentItemDto {
  readonly contentId: string;
  readonly checklist: {                     // QA чеклист
    hasDisclaimers: boolean;
    toneChecked: boolean;                   // Нет "лечим/диагноз/гарантии"
    hasCta: boolean;
    hasInternalLinks: boolean;
  };
}
```

**Алгоритм выполнения:**

1. **Проверка чеклиста:**
   - Проверить, что все пункты отмечены

2. **Публикация:**
   - Обновить статус контента на `published`
   - Сохранить через `IContentRepository.save(content)`

3. **Публикация событий:**
   - `ContentPublishedEvent`

**Domain Events:**
- `ContentPublishedEvent`

---

### 8.3 ModerateUGCItemUseCase

**Назначение:** Модерация UGC (анонимный вопрос/отзыв).

**Входной DTO:**
```typescript
export class ModerateUGCItemDto {
  readonly itemId: string;
  readonly decision: 'approve' | 'reject';
  readonly reason?: string;                 // Для reject
  readonly moderatorId: string;
}
```

**Алгоритм выполнения:**

1. **Получение агрегата:**
   - Получить `ModerationItem` из `IModerationItemRepository.findById(itemId)`

2. **Модерация:**
   - Если `decision === 'approve'`:
     - Вызвать `item.approve(moderatorId)`
   - Иначе:
     - Вызвать `item.reject(moderatorId, reason)`

3. **Сохранение и события:**
   - Сохранить, опубликовать `UGCModeratedEvent`

**Domain Events:**
- `UGCModeratedEvent`

---

### 8.4 AnswerUGCQuestionUseCase

**Назначение:** Ответ на анонимный вопрос.

**Входной DTO:**
```typescript
export class AnswerUGCQuestionDto {
  readonly itemId: string;
  readonly answerText: string;
  readonly ownerId: string;                 // ID психолога (owner)
}
```

**Алгоритм выполнения:**

1. **Получение агрегата:**
   - Получить `ModerationItem`

2. **Проверка статуса:**
   - Проверить, что статус `approved`

3. **Шифрование ответа:**
   - Зашифровать `answerText` через `IEncryptionService.encrypt()`

4. **Ответ:**
   - Вызвать `item.answerQuestion(ownerId, encryptedAnswer, encryptionService)`

5. **Сохранение и события:**
   - Сохранить, опубликовать `UGCAnsweredEvent`

**Domain Events:**
- `UGCAnsweredEvent`

---

### 8.5 RecordAppointmentOutcomeUseCase (Admin)

**Назначение:** Отметка исхода встречи администратором.

**Алгоритм:** Аналогично `RecordAppointmentOutcomeUseCase` из Booking Domain, но с проверкой прав администратора.

---

### 8.6 GetLeadsListUseCase

**Назначение:** Получение списка лидов для CRM.

**Входной DTO:**
```typescript
export class GetLeadsListDto {
  readonly page?: number;
  readonly perPage?: number;
  readonly status?: string;
  readonly source?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}
```

**Выходной DTO:**
```typescript
export class LeadsListResponseDto {
  readonly data: {
    id: string;
    status: string;
    source: string;
    topicCode?: string;
    timelineEvents: {
      eventName: string;
      occurredAt: string;
      source: string;
    }[];
    createdAt: string;
  }[];
  readonly pagination: PaginationDto;
}
```

**Алгоритм выполнения:**

1. **Получение лидов:**
   - Получить через `ILeadRepository.findByFilters(filters)`

2. **Возврат DTO:**
   - Маппинг в `LeadsListResponseDto`

**Важно:** Timeline events не содержат чувствительных текстов (только типы событий).

---

## 9) Telegram Integration Domain — Use Cases

### 9.1 HandleTelegramWebhookUseCase

**Назначение:** Обработка webhook от Telegram Bot API.

**Входной DTO:**
```typescript
export class TelegramWebhookDto {
  readonly update: {
    message?: {
      chat: { id: number };
      text?: string;
      from: { id: number; username?: string };
    };
    callback_query?: {
      data: string;
      from: { id: number };
    };
  };
}
```

**Алгоритм выполнения:**

1. **Парсинг команды:**
   - Определить тип команды: `/start`, `/stop`, callback query

2. **Обработка:**
   - Если `/start` с deep link:
     - Извлечь `deepLinkId` из параметров
     - Создать/обновить `Lead`: добавить событие `tg_subscribe_confirmed`
   - Если callback query:
     - Обработать действие (например, выбор темы, частоты)

3. **Отправка ответа:**
   - Отправить ответ через `ITelegramService.sendMessage(chatId, text)`

---

### 9.2 SendTelegramPlanUseCase

**Назначение:** Отправка плана на 7 дней в Telegram.

**Входной DTO:**
```typescript
export class SendTelegramPlanDto {
  readonly telegramUserId: string;
  readonly topicCode: string;
  readonly deepLinkId?: string;
}
```

**Алгоритм выполнения:**

1. **Получение плана:**
   - Получить план из конфигурации/БД по `topicCode`

2. **Отправка:**
   - Отправить через `ITelegramService.sendPlan(telegramUserId, plan)`

3. **Обновление Lead:**
   - Если `deepLinkId` указан:
     - Обновить `Lead`: добавить событие `tg_plan_sent`

---

## 10) Общие паттерны и рекомендации

### 10.1 Обработка ошибок

Все Use Cases должны выбрасывать `ApplicationError` с соответствующими HTTP кодами:

```typescript
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number,
    public readonly details?: any
  ) {
    super(message);
  }
}
```

**Стандартные коды ошибок:**
- `NOT_FOUND` → 404
- `VALIDATION_ERROR` → 422
- `FORBIDDEN` → 403
- `UNAUTHORIZED` → 401
- `CONFLICT` → 409
- `INTERNAL_ERROR` → 500

### 10.2 Валидация входных данных

Использовать библиотеку валидации (например, `class-validator` для TypeScript или встроенную валидацию Django):

```typescript
export class BookAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  readonly serviceId: string;

  @IsOptional()
  @IsUUID()
  readonly slotId?: string;

  @IsEnum(['online', 'offline'])
  readonly format: 'online' | 'offline';
  
  // ...
}
```

### 10.3 Транзакции

Все операции, изменяющие состояние, должны выполняться в транзакциях:

```typescript
await this.db.transaction(async (tx) => {
  await tx.appointments.save(appointment);
  await tx.payments.save(payment);
  await this.eventBus.publish(events);
});
```

### 10.4 Идемпотентность

Webhook handlers и критические операции должны быть идемпотентными:

```typescript
// Проверка: не обработан ли уже этот webhook?
const existing = await this.webhookLogRepository.findByProviderId(providerPaymentId);
if (existing && existing.event === event) {
  return { success: true, alreadyProcessed: true };
}
```

### 10.5 Маппинг Domain → DTO

Использовать отдельные mapper классы:

```typescript
export class AppointmentMapper {
  static toDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.appointmentId.value,
      service: {
        id: appointment.serviceId.value,
        // ...
      },
      // ...
    };
  }
}
```

---

## 11) Тестирование

### 11.1 Unit тесты

Каждый Use Case должен иметь unit тесты:

```typescript
describe('BookAppointmentUseCase', () => {
  it('should create appointment successfully', async () => {
    // Arrange
    const mockService = createMockService();
    const mockUser = createMockUser();
    const dto = createBookAppointmentDto();

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.status).toBe('pending_payment');
  });

  it('should throw error if service not found', async () => {
    // Arrange
    serviceRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow('Service not found');
  });
});
```

### 11.2 Integration тесты

Проверка взаимодействия с репозиториями и сервисами:

```typescript
describe('BookAppointmentUseCase Integration', () => {
  it('should save appointment and publish events', async () => {
    // Arrange
    const dto = createBookAppointmentDto();

    // Act
    await useCase.execute(dto);

    // Assert
    const saved = await appointmentRepository.findById(appointmentId);
    expect(saved).toBeDefined();
    
    const events = await eventBus.getPublishedEvents();
    expect(events).toContainEqual(expect.objectContaining({
      eventName: 'AppointmentCreated'
    }));
  });
});
```

---

## 12) Следующие шаги

После реализации всех Use Cases:

1. ✅ Интеграция с Presentation Layer (API controllers)
2. ✅ Написание unit и integration тестов
3. ✅ Документация API (OpenAPI/Swagger)
4. ✅ Настройка мониторинга и логирования
5. ✅ Performance тестирование

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ **Готово к реализации**

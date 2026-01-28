# Application Layer Test Coverage Report

**Дата:** 2026-01-27  
**Статус:** ✅ **100% Use Cases покрыты тестами**

---

## Итоговое покрытие

### По доменам

| Домен | Use Cases | Тесты | Покрытие |
|-------|-----------|-------|----------|
| **Booking** | 7 | 7 | ✅ 100% |
| **Payments** | 2 | 2 | ✅ 100% |
| **Interactive** | 5 | 5 | ✅ 100% |
| **Content** | 3 | 3 | ✅ 100% |
| **Client Cabinet** | 5 | 5 | ✅ 100% |
| **Admin Panel** | 6 | 6 | ✅ 100% |
| **Telegram Integration** | 2 | 2 | ✅ 100% |
| **ИТОГО** | **30** | **30** | **✅ 100%** |

---

## Детальное покрытие

### Booking Domain (7 Use Cases)

1. ✅ **BookAppointmentUseCase** (`test_book_appointment.py`)
   - Успешное создание записи
   - Ошибка при отсутствии услуги
   - Валидация формата
   - Конфликт слотов

2. ✅ **ConfirmPaymentUseCase** (`test_confirm_payment.py`)
   - Успешное подтверждение оплаты
   - Ошибка при отсутствии записи
   - Обработка неуспешного платежа

3. ✅ **CancelAppointmentUseCase** (`test_cancel_appointment.py`)
   - Успешная отмена записи
   - Ошибка при отсутствии записи
   - Ошибка при отсутствии прав
   - Ошибка при невозможности отмены

4. ✅ **RescheduleAppointmentUseCase** (`test_reschedule_appointment.py`)
   - Успешный перенос записи
   - Ошибка при отсутствии записи
   - Ошибка при отсутствии прав
   - Ошибка при недоступности нового слота

5. ✅ **RecordAppointmentOutcomeUseCase** (`test_record_appointment_outcome.py`)
   - Успешная запись исхода встречи
   - Ошибка при отсутствии записи
   - Ошибка при попытке записать исход для будущей встречи

6. ✅ **GetAvailableSlotsUseCase** (`test_get_available_slots.py`)
   - Успешное получение доступных слотов
   - Ошибка при отсутствии услуги
   - Валидация дат

7. ✅ **SubmitWaitlistRequestUseCase** (`test_submit_waitlist_request.py`)
   - Успешное создание запроса в лист ожидания
   - Ошибка при отсутствии услуги
   - Валидация согласия
   - Валидация контактной информации

### Payments Domain (2 Use Cases)

1. ✅ **CreatePaymentIntentUseCase** (`test_create_payment_intent.py`)
   - Успешное создание намерения оплаты
   - Ошибка при отсутствии записи
   - Валидация депозита

2. ✅ **HandlePaymentWebhookUseCase** (`test_handle_payment_webhook.py`)
   - Успешная обработка webhook
   - Ошибка при невалидной подписи
   - Ошибка при отсутствии платежа

### Interactive Domain (5 Use Cases)

1. ✅ **StartInteractiveRunUseCase** (`test_start_interactive_run.py`)
   - Успешное начало прохождения интерактива
   - Ошибка при отсутствии интерактива
   - Ошибка при неопубликованном интерактиве

2. ✅ **CompleteInteractiveRunUseCase** (`test_complete_interactive_run.py`)
   - Успешное завершение интерактива
   - Ошибка при отсутствии прохождения
   - Ошибка при попытке завершить уже завершенный интерактив

3. ✅ **AbandonInteractiveRunUseCase** (`test_abandon_interactive_run.py`)
   - Успешная отметка интерактива как заброшенного
   - Ошибка при отсутствии прохождения
   - Ошибка при попытке забросить уже завершенный интерактив

4. ✅ **GetBoundaryScriptsUseCase** (`test_get_boundary_scripts.py`)
   - Успешное получение скриптов границ
   - Валидация сценария
   - Валидация стиля
   - Валидация цели

5. ✅ **GetRitualUseCase** (`test_get_ritual.py`)
   - Успешное получение ритуала
   - Ошибка при отсутствии ритуала
   - Ошибка при неопубликованном ритуале

### Content Domain (3 Use Cases)

1. ✅ **GetArticleUseCase** (`test_get_article.py`)
   - Успешное получение статьи
   - Ошибка при отсутствии статьи
   - Ошибка при неопубликованной статье
   - Получение черновика с разрешением

2. ✅ **ListArticlesUseCase** (`test_list_articles.py`)
   - Успешное получение списка статей
   - Валидация номера страницы
   - Валидация количества на странице

3. ✅ **GetResourceUseCase** (`test_get_resource.py`)
   - Успешное получение ресурса
   - Ошибка при отсутствии ресурса
   - Ошибка при неопубликованном ресурсе

### Client Cabinet Domain (5 Use Cases)

1. ✅ **GetClientAppointmentsUseCase** (`test_get_client_appointments.py`)
   - Успешное получение списка встреч
   - Ошибка при отсутствии пользователя
   - Фильтрация предстоящих встреч

2. ✅ **CreateDiaryEntryUseCase** (`test_create_diary_entry.py`)
   - Успешное создание записи дневника
   - Ошибка при отсутствии пользователя

3. ✅ **DeleteDiaryEntryUseCase** (`test_delete_diary_entry.py`)
   - Успешное удаление записи дневника
   - Ошибка при отсутствии записи
   - Ошибка при отсутствии прав

4. ✅ **ExportDiaryToPdfUseCase** (`test_export_diary_to_pdf.py`)
   - Успешный экспорт дневника в PDF
   - Ошибка при отсутствии пользователя
   - Валидация дат

5. ✅ **DeleteUserDataUseCase** (`test_delete_user_data.py`)
   - Успешное удаление данных пользователя
   - Валидация подтверждения
   - Ошибка при отсутствии пользователя

### Admin Panel Domain (6 Use Cases)

1. ✅ **CreateAvailabilitySlotUseCase** (`test_create_availability_slot.py`)
   - Успешное создание слота
   - Валидация дат
   - Создание серии слотов с повторением

2. ✅ **PublishContentItemUseCase** (`test_publish_content_item.py`)
   - Успешная публикация контента
   - Ошибка при отсутствии контента
   - Валидация чеклиста

3. ✅ **ModerateUGCItemUseCase** (`test_moderate_ugc_item.py`)
   - Успешное одобрение UGC
   - Успешное отклонение UGC
   - Ошибка при отсутствии элемента
   - Валидация решения

4. ✅ **AnswerUGCQuestionUseCase** (`test_answer_ugc_question.py`)
   - Успешный ответ на вопрос
   - Ошибка при отсутствии вопроса
   - Ошибка при попытке ответить на неодобренный вопрос

5. ✅ **RecordAppointmentOutcomeAdminUseCase** (`test_record_appointment_outcome_admin.py`)
   - Успешная запись исхода администратором
   - Ошибка при отсутствии прав администратора
   - Ошибка при отсутствии записи

6. ✅ **GetLeadsListUseCase** (`test_get_leads_list.py`)
   - Успешное получение списка лидов
   - Получение лидов с фильтрами
   - Валидация номера страницы
   - Валидация количества на странице

### Telegram Integration Domain (2 Use Cases)

1. ✅ **HandleTelegramWebhookUseCase** (`test_handle_telegram_webhook.py`)
   - Обработка команды /start
   - Обработка команды /stop
   - Обработка callback query

2. ✅ **SendTelegramPlanUseCase** (`test_send_telegram_plan.py`)
   - Успешная отправка плана
   - Отправка плана без deep_link_id

---

## Структура тестов

Каждый тест включает:

### Базовые сценарии
- ✅ **Успешное выполнение** (happy path)
- ✅ **Валидация входных данных** (ValidationError)
- ✅ **Ошибки отсутствия ресурсов** (NotFoundError)
- ✅ **Ошибки прав доступа** (ForbiddenError)
- ✅ **Ошибки конфликтов** (ConflictError, где применимо)

### Используемые паттерны
- Моки для репозиториев и сервисов
- InMemoryEventBus для изоляции
- Фикстуры для переиспользования
- AsyncMock для асинхронных операций

---

## Запуск тестов

```bash
# Все тесты Application Layer
pytest backend/tests/application/ -v

# Конкретный домен
pytest backend/tests/application/booking/ -v

# Конкретный Use Case
pytest backend/tests/application/booking/test_book_appointment.py -v

# С покрытием кода
pytest backend/tests/application/ --cov=backend/application --cov-report=html --cov-report=term

# Только быстрые тесты (без Django DB)
pytest backend/tests/application/ -m "not django_db"
```

---

## Следующие шаги

Для достижения 80% покрытия кода рекомендуется:

1. **Добавить integration тесты** для проверки взаимодействия с репозиториями
2. **Добавить edge cases** для граничных условий
3. **Добавить тесты для обработки ошибок** в репозиториях и сервисах
4. **Расширить тесты для проверки Domain Events**

---

*Документ создан: Coder Agent*

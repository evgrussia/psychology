# Phase 7: Решение проблем с тестовыми данными

## Проблема

Некоторые тесты Phase 7 требовали дополнительных fixtures для создания тестовых данных (ServiceModel, AvailabilitySlotModel, AppointmentModel, PaymentModel, InteractiveDefinitionModel, ContentItemModel, DiaryEntryModel и др.).

## Решение

### 1. Добавлены зависимости

- `factory-boy>=3.3.0` - для создания тестовых данных
- `pytest-factoryboy>=2.6.1` - интеграция factory-boy с pytest

Добавлено в `backend/requirements.txt`.

### 2. Создан файл factories.py

Создан `backend/tests/factories.py` с factories для всех необходимых Django моделей:

- `ServiceModelFactory` - для услуг
- `AvailabilitySlotModelFactory` - для слотов доступности
- `AppointmentModelFactory` - для бронирований
- `PaymentModelFactory` - для платежей
- `InteractiveDefinitionModelFactory` - для интерактивов (квизы, навигаторы и т.д.)
- `InteractiveRunModelFactory` - для прохождений интерактивов
- `ContentItemModelFactory` - для контента (статьи, ресурсы)
- `DiaryEntryModelFactory` - для записей дневника

### 3. Обновлен conftest.py

Добавлены fixtures для всех моделей:

#### Fixtures для Django моделей:
- `service` - базовая услуга
- `published_service` - опубликованная услуга
- `availability_slot` - слот доступности
- `available_slot` - доступный слот
- `appointment` - бронирование
- `payment` - платеж
- `interactive_definition` - определение интерактива
- `published_quiz` - опубликованный квиз
- `interactive_run` - прохождение интерактива
- `content_article` - статья
- `diary_entry` - запись дневника

#### Helper fixtures для аутентификации:
- `user_repository` - репозиторий пользователей
- `password_service` - сервис для работы с паролями
- `api_client` - APIClient для тестов
- `authenticated_user` - пользователь с паролем и согласием
- `authenticated_client` - APIClient с аутентифицированным пользователем (JWT токен)
- `authenticated_user_with_consent` - пользователь с согласием на обработку ПДн

### 4. Создана документация

- `backend/tests/integration/FIXTURES_README.md` - подробная документация по использованию fixtures
- `backend/tests/integration/PHASE7_FIXTURES_SUMMARY.md` - этот файл

## Использование

### Базовый пример

```python
@pytest.mark.django_db
@pytest.mark.integration
def test_service_endpoint(api_client, published_service):
    """Тест endpoint для услуг."""
    response = api_client.get('/api/v1/booking/services/')
    assert response.status_code == 200
```

### Пример с аутентификацией

```python
@pytest.mark.django_db
@pytest.mark.integration
def test_authenticated_endpoint(authenticated_client, service):
    """Тест endpoint, требующего аутентификации."""
    client = authenticated_client['client']
    response = client.get(f'/api/v1/booking/services/{service.id}/')
    assert response.status_code == 200
```

### Пример с кастомными данными

```python
from tests.factories import ServiceModelFactory

@pytest.mark.django_db
def test_custom_service():
    """Создание услуги с кастомными параметрами."""
    service = ServiceModelFactory(
        slug='custom-service',
        price_amount=10000.0,
        status='draft'
    )
    assert service.status == 'draft'
```

## Следующие шаги

1. Обновить существующие тесты Phase 7 для использования новых fixtures
2. Запустить тесты и убедиться, что все проходят
3. При необходимости добавить дополнительные fixtures для специфических случаев

## Файлы

- `backend/requirements.txt` - добавлены factory-boy и pytest-factoryboy
- `backend/tests/factories.py` - factories для всех моделей
- `backend/tests/conftest.py` - обновлен с новыми fixtures
- `backend/tests/integration/FIXTURES_README.md` - документация
- `backend/tests/integration/PHASE7_FIXTURES_SUMMARY.md` - этот файл

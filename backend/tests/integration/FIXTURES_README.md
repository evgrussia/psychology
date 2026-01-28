# Fixtures для Phase 7 Integration Tests

Этот документ описывает доступные fixtures для интеграционных тестов Phase 7.

## Установка зависимостей

```bash
pip install -r requirements-dev.txt
```

Включает:
- `factory-boy>=3.3.0` - для создания тестовых данных
- `pytest-factoryboy>=2.6.1` - интеграция factory-boy с pytest
- `pytest-django>=4.5.0` - поддержка Django в pytest

## Использование fixtures

### Django модели (через factories)

#### ServiceModel

```python
@pytest.mark.django_db
def test_service(service):
    """Использует fixture service."""
    assert service.status == 'published'
    assert service.slug is not None

@pytest.mark.django_db
def test_published_service(published_service):
    """Использует fixture для опубликованной услуги."""
    assert published_service.status == 'published'
```

#### AvailabilitySlotModel

```python
@pytest.mark.django_db
def test_availability_slot(availability_slot, service):
    """Использует fixture availability_slot."""
    assert availability_slot.service_id == service.id
    assert availability_slot.status == 'available'
```

#### AppointmentModel

```python
@pytest.mark.django_db
def test_appointment(appointment, service):
    """Использует fixture appointment."""
    assert appointment.service_id == service.id
    assert appointment.status == 'pending_payment'
```

#### PaymentModel

```python
@pytest.mark.django_db
def test_payment(payment, appointment):
    """Использует fixture payment."""
    assert payment.appointment_id == appointment.id
    assert payment.provider == 'yookassa'
```

#### InteractiveDefinitionModel

```python
@pytest.mark.django_db
def test_quiz(published_quiz):
    """Использует fixture для опубликованного квиза."""
    assert published_quiz.interactive_type == 'quiz'
    assert published_quiz.status == 'published'
```

#### ContentItemModel

```python
@pytest.mark.django_db
def test_article(content_article):
    """Использует fixture для статьи."""
    assert content_article.content_type == 'article'
    assert content_article.status == 'published'
```

#### DiaryEntryModel

```python
@pytest.mark.django_db
def test_diary_entry(diary_entry):
    """Использует fixture для записи дневника."""
    assert diary_entry.diary_type == 'mood'
    assert diary_entry.content_encrypted is not None
```

### Аутентификация

#### authenticated_user

Создает пользователя в БД с паролем и согласием на обработку ПДн.

```python
@pytest.mark.django_db
def test_with_user(authenticated_user):
    """Использует fixture authenticated_user."""
    user = authenticated_user['user']
    email = authenticated_user['email']
    password = authenticated_user['password']
    user_id = authenticated_user['user_id']
    
    assert user.email.value == email
```

#### authenticated_client

Создает APIClient с аутентифицированным пользователем (с JWT токеном).

```python
@pytest.mark.django_db
def test_authenticated_endpoint(authenticated_client):
    """Использует fixture authenticated_client."""
    client = authenticated_client['client']
    user = authenticated_client['user']
    token = authenticated_client['token']
    
    # Client уже настроен с токеном
    response = client.get('/api/v1/booking/services/')
    assert response.status_code == 200
```

#### authenticated_user_with_consent

Создает пользователя с согласием на обработку ПДн (для endpoints, требующих HasConsent permission).

```python
@pytest.mark.django_db
def test_consent_required(authenticated_user_with_consent, api_client):
    """Использует fixture authenticated_user_with_consent."""
    user_data = authenticated_user_with_consent
    
    # Логин
    login_response = api_client.post('/api/v1/auth/login/', {
        'email': user_data['email'],
        'password': user_data['password'],
    }, format='json')
    
    token = login_response.data['data']['token']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Теперь можно вызывать endpoints, требующие согласия
    response = api_client.get('/api/v1/interactive/diaries/')
    assert response.status_code == 200
```

### Helper fixtures

#### api_client

```python
@pytest.mark.django_db
def test_api(api_client):
    """Использует fixture api_client."""
    response = api_client.get('/api/v1/content/articles/')
    assert response.status_code == 200
```

#### user_repository

```python
@pytest.mark.django_db
def test_repository(user_repository):
    """Использует fixture user_repository."""
    user = User.create(email=Email.create('test@example.com'))
    async_to_sync(user_repository.save)(user)
    # ...
```

#### password_service

```python
def test_password(password_service):
    """Использует fixture password_service."""
    password_hash = password_service.hash_password('password123')
    assert password_service.verify_password('password123', password_hash)
```

## Примеры использования в тестах

### Пример 1: Тест booking endpoint с аутентификацией

```python
@pytest.mark.django_db
@pytest.mark.integration
class TestBookingEndpoint(TestCase):
    def test_create_appointment(self, authenticated_client, service, available_slot):
        """Тест создания бронирования."""
        client = authenticated_client['client']
        
        payload = {
            'service_id': str(service.id),
            'slot_id': str(available_slot.id),
            'format': 'online',
            'start_at': available_slot.start_at.isoformat(),
            'end_at': available_slot.end_at.isoformat(),
            'timezone': 'Europe/Moscow',
        }
        
        response = client.post('/api/v1/booking/appointments/', payload, format='json')
        assert response.status_code == 201
```

### Пример 2: Тест interactive endpoint

```python
@pytest.mark.django_db
@pytest.mark.integration
class TestInteractiveEndpoint(TestCase):
    def test_start_quiz(self, authenticated_client, published_quiz):
        """Тест начала квиза."""
        client = authenticated_client['client']
        
        response = client.post(
            f'/api/v1/interactive/quizzes/{published_quiz.slug}/start/',
            {},
            format='json'
        )
        assert response.status_code == 201
```

### Пример 3: Тест content endpoint

```python
@pytest.mark.django_db
@pytest.mark.integration
class TestContentEndpoint(TestCase):
    def test_list_articles(self, api_client, content_article):
        """Тест списка статей."""
        response = api_client.get('/api/v1/content/articles/')
        assert response.status_code == 200
        assert len(response.data['data']) >= 1
```

## Создание кастомных данных

Если нужно создать данные с особыми параметрами, используйте factories напрямую:

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
    assert service.price_amount == 10000.0
    assert service.status == 'draft'
```

## Примечания

1. Все fixtures для Django моделей требуют `@pytest.mark.django_db`
2. Fixtures автоматически создают связанные объекты (например, `availability_slot` создает `service`)
3. Для аутентифицированных endpoints используйте `authenticated_client`
4. Для endpoints, требующих согласия, используйте `authenticated_user_with_consent` или вызывайте `grant_consent_to_user()` вручную

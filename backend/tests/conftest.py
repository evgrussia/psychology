"""
Общие фикстуры для тестов.
"""
import pytest
from datetime import datetime, timezone, timedelta
from rest_framework.test import APIClient
from asgiref.sync import async_to_sync

from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.role import Role
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.aggregates.user import User, UserId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.payments.value_objects.payment_provider import PaymentProvider

from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService
from infrastructure.events.in_memory_event_bus import InMemoryEventBus

# Импорт factories
from tests.factories import (
    ServiceModelFactory,
    AvailabilitySlotModelFactory,
    AppointmentModelFactory,
    PaymentModelFactory,
    InteractiveDefinitionModelFactory,
    InteractiveRunModelFactory,
    ContentItemModelFactory,
    DiaryEntryModelFactory,
)


@pytest.fixture
def sample_email():
    """Фикстура для Email."""
    return Email.create("test@example.com")


@pytest.fixture
def sample_phone():
    """Фикстура для PhoneNumber."""
    return PhoneNumber.create("+79991234567")


@pytest.fixture
def sample_user(sample_email):
    """Фикстура для User."""
    return User.create(email=sample_email)


@pytest.fixture
def sample_user_id():
    """Фикстура для UserId."""
    return UserId.generate()


@pytest.fixture
def sample_money():
    """Фикстура для Money."""
    return Money(amount=1000.0, currency=Currency.RUB)


@pytest.fixture
def sample_time_slot():
    """Фикстура для TimeSlot."""
    start = datetime.now(timezone.utc) + timedelta(hours=24)
    end = start + timedelta(hours=1)
    return TimeSlot(
        start_at=start,
        end_at=end,
        timezone=Timezone.UTC
    )


@pytest.fixture
def sample_payment_provider():
    """Фикстура для PaymentProvider."""
    return PaymentProvider.YUKASSA


# ========== Fixtures для Django моделей (Phase 7) ==========

@pytest.fixture
def service(db):
    """Фикстура для ServiceModel."""
    return ServiceModelFactory()


@pytest.fixture
def published_service(db):
    """Фикстура для опубликованной услуги."""
    return ServiceModelFactory(status='published')


@pytest.fixture
def availability_slot(db, service):
    """Фикстура для AvailabilitySlotModel."""
    return AvailabilitySlotModelFactory(service_id=service.id)


@pytest.fixture
def available_slot(db, service):
    """Фикстура для доступного слота."""
    return AvailabilitySlotModelFactory(
        service_id=service.id,
        status='available'
    )


@pytest.fixture
def appointment(db, service):
    """Фикстура для AppointmentModel."""
    return AppointmentModelFactory(service_id=service.id)


@pytest.fixture
def payment(db, appointment):
    """Фикстура для PaymentModel."""
    return PaymentModelFactory(appointment_id=appointment.id)


@pytest.fixture
def interactive_definition(db):
    """Фикстура для InteractiveDefinitionModel."""
    return InteractiveDefinitionModelFactory()


@pytest.fixture
def published_quiz(db):
    """Фикстура для опубликованного квиза."""
    return InteractiveDefinitionModelFactory(
        interactive_type='quiz',
        status='published'
    )


@pytest.fixture
def interactive_run(db, interactive_definition):
    """Фикстура для InteractiveRunModel."""
    return InteractiveRunModelFactory(
        interactive_definition_id=interactive_definition.id
    )


@pytest.fixture
def content_article(db):
    """Фикстура для ContentItemModel (статья)."""
    return ContentItemModelFactory(
        content_type='article',
        status='published'
    )


@pytest.fixture
def diary_entry(db):
    """Фикстура для DiaryEntryModel."""
    return DiaryEntryModelFactory()


# ========== Helper fixtures для аутентификации ==========

@pytest.fixture
def user_repository():
    """Фикстура для UserRepository."""
    return DjangoUserRepository(event_bus=InMemoryEventBus())


@pytest.fixture
def password_service():
    """Фикстура для PasswordService."""
    return PasswordService()


@pytest.fixture
def api_client():
    """Фикстура для APIClient."""
    return APIClient()


@pytest.fixture
def authenticated_user(db, user_repository, password_service):
    """Фикстура для создания и сохранения пользователя в БД."""
    email = Email.create(f"test_{datetime.now().timestamp()}@example.com")
    user = User.create(email=email)
    async_to_sync(user_repository.save)(user)
    
    # Установить пароль
    password = "TestPassword123!"
    password_hash = password_service.hash_password(password)
    user_repository.set_password_hash(user.id.value, password_hash)
    
    # Выдать согласие на обработку ПДн
    grant_consent_to_user(user.id.value)
    
    return {
        'user': user,
        'email': email.value,
        'password': password,
        'user_id': user.id.value,
    }


@pytest.fixture
def authenticated_client(db, api_client, authenticated_user):
    """Фикстура для APIClient с аутентифицированным пользователем."""
    # Логин через API
    login_response = api_client.post('/api/v1/auth/login/', {
        'email': authenticated_user['email'],
        'password': authenticated_user['password'],
    }, format='json')
    
    # Cookies устанавливаются автоматически в api_client при успешном входе
    access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    return {
        'client': api_client,
        'user': authenticated_user['user'],
        'user_id': authenticated_user['user_id'],
        'token': access_token,
    }


@pytest.fixture
def authenticated_user_with_consent(db, user_repository, password_service):
    """Фикстура для пользователя с согласием на обработку ПДн."""
    email = Email.create(f"consent_user_{datetime.now().timestamp()}@example.com")
    user = User.create(email=email)
    async_to_sync(user_repository.save)(user)
    
    password = "TestPassword123!"
    password_hash = password_service.hash_password(password)
    user_repository.set_password_hash(user.id.value, password_hash)
    
    # Выдать согласие
    grant_consent_to_user(user.id.value)
    
    return {
        'user': user,
        'email': email.value,
        'password': password,
        'user_id': user.id.value,
    }


def grant_consent_to_user(user_id, consent_type='personal_data', version='2026-01-26', source='web'):
    """Helper функция для выдачи согласия пользователю в тестах."""
    from infrastructure.persistence.repositories.consent_repository import DjangoConsentRepository
    consent_repo = DjangoConsentRepository()
    consent_repo.grant_consent(
        user_id=user_id,
        consent_type=consent_type,
        version=version,
        source=source
    )

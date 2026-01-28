"""
Unit тесты для BookAppointmentUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.book_appointment import BookAppointmentUseCase
from application.booking.dto import BookAppointmentDto
from application.exceptions import NotFoundError, ValidationError, ConflictError
from domain.booking.aggregates.appointment import AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.identity.aggregates.user import User, UserId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.booking.value_objects.appointment_format import AppointmentFormat
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_service_repository():
    """Мок репозитория услуг."""
    service = MagicMock(spec=Service)
    service.id = ServiceId.generate()
    service.slug = "consultation"
    service.name = "Консультация"
    service.price = Money(5000.0, Currency.RUB)
    service.duration_minutes = 60
    service.is_available_for = MagicMock(return_value=True)
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    user.has_active_consent = MagicMock(return_value=True)
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    return repo


@pytest.fixture
def mock_payment_repository():
    """Мок репозитория платежей."""
    return AsyncMock()


@pytest.fixture
def mock_availability_slot_repository():
    """Мок репозитория слотов."""
    return AsyncMock()


@pytest.fixture
def mock_slot_availability_service():
    """Мок сервиса проверки доступности."""
    service = AsyncMock()
    service.is_slot_available = AsyncMock(return_value=True)
    return service


@pytest.fixture
def mock_payment_adapter():
    """Мок адаптера платежей."""
    adapter = AsyncMock()
    adapter.create_payment_intent = AsyncMock(return_value={
        'payment_id': 'test_payment_id',
        'confirmation_url': 'https://example.com/pay',
        'status': 'intent'
    })
    return adapter


@pytest.fixture
def mock_encryption_service():
    """Мок сервиса шифрования."""
    service = MagicMock()
    service.encrypt = MagicMock(return_value='encrypted_data')
    return service


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_appointment_repository,
    mock_service_repository,
    mock_user_repository,
    mock_payment_repository,
    mock_availability_slot_repository,
    mock_slot_availability_service,
    mock_payment_adapter,
    mock_encryption_service,
    mock_lead_repository,
    event_bus
):
    """Фикстура для Use Case."""
    return BookAppointmentUseCase(
        appointment_repository=mock_appointment_repository,
        service_repository=mock_service_repository,
        user_repository=mock_user_repository,
        payment_repository=mock_payment_repository,
        availability_slot_repository=mock_availability_slot_repository,
        slot_availability_service=mock_slot_availability_service,
        payment_adapter=mock_payment_adapter,
        encryption_service=mock_encryption_service,
        lead_repository=mock_lead_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_book_appointment_success(use_case, mock_appointment_repository, mock_service_repository):
    """Тест успешного создания записи."""
    # Arrange
    start_at = datetime.now(timezone.utc) + timedelta(days=1)
    end_at = start_at + timedelta(hours=1)
    
    dto = BookAppointmentDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        user_id=str(UserId.generate().value),
        start_at=start_at.isoformat(),
        end_at=end_at.isoformat(),
        timezone='UTC',
        format='online',
        consents={'personalData': True}
    )
    
    # Mock сохранения
    mock_appointment_repository.save_with_conflict_check = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.id is not None
    assert result.status == 'pending_payment'
    mock_appointment_repository.save_with_conflict_check.assert_called_once()


@pytest.mark.asyncio
async def test_book_appointment_service_not_found(use_case, mock_service_repository):
    """Тест ошибки при отсутствии услуги."""
    # Arrange
    mock_service_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = BookAppointmentDto(
        service_id=str(ServiceId.generate().value),
        user_id=str(UserId.generate().value),
        start_at=(datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        end_at=(datetime.now(timezone.utc) + timedelta(days=1, hours=1)).isoformat(),
        timezone='UTC',
        format='online',
        consents={'personalData': True}
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Service not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_book_appointment_invalid_format(use_case):
    """Тест валидации формата."""
    # Arrange
    dto = BookAppointmentDto(
        service_id=str(ServiceId.generate().value),
        user_id=str(UserId.generate().value),
        start_at=(datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        end_at=(datetime.now(timezone.utc) + timedelta(days=1, hours=1)).isoformat(),
        timezone='UTC',
        format='invalid_format',
        consents={'personalData': True}
    )
    
    # Act & Assert
    with pytest.raises(ValidationError):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_book_appointment_slot_conflict(use_case, mock_appointment_repository, mock_slot_availability_service):
    """Тест конфликта слотов."""
    # Arrange
    mock_slot_availability_service.is_slot_available = AsyncMock(return_value=False)
    
    dto = BookAppointmentDto(
        service_id=str(ServiceId.generate().value),
        user_id=str(UserId.generate().value),
        start_at=(datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        end_at=(datetime.now(timezone.utc) + timedelta(days=1, hours=1)).isoformat(),
        timezone='UTC',
        format='online',
        consents={'personalData': True}
    )
    
    # Act & Assert
    with pytest.raises(ConflictError, match="Slot is not available"):
        await use_case.execute(dto)

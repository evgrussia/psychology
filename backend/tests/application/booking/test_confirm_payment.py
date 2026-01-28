"""
Unit тесты для ConfirmPaymentUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.confirm_payment import ConfirmPaymentUseCase
from application.booking.dto import ConfirmPaymentDto
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.value_objects.payment_status import PaymentStatus
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
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
    service.name = "Консультация"
    service.price = Money(5000.0, Currency.RUB)
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    user.email = Email.create("test@example.com")
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    return repo


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    return AsyncMock()


@pytest.fixture
def mock_email_service():
    """Мок email сервиса."""
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
    mock_lead_repository,
    mock_email_service,
    event_bus
):
    """Фикстура для Use Case."""
    return ConfirmPaymentUseCase(
        appointment_repository=mock_appointment_repository,
        service_repository=mock_service_repository,
        user_repository=mock_user_repository,
        lead_repository=mock_lead_repository,
        event_bus=event_bus,
        email_service=mock_email_service
    )


@pytest.mark.asyncio
async def test_confirm_payment_success(use_case, mock_appointment_repository, mock_service_repository):
    """Тест успешного подтверждения оплаты."""
    # Arrange
    appointment_id = AppointmentId.generate()
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.service_id = mock_service_repository.find_by_id.return_value.id
    appointment.client_id = UserId.generate()
    appointment.slot = MagicMock()
    appointment.slot.start_at = datetime.now(timezone.utc)
    appointment.slot.end_at = datetime.now(timezone.utc) + timedelta(hours=1)
    appointment.format = MagicMock()
    appointment.format.value = 'online'
    appointment.metadata = MagicMock()
    appointment.metadata.deep_link_id = None
    appointment.confirm_payment = MagicMock()
    appointment.assign_payment = MagicMock()
    appointment.get_domain_events = MagicMock(return_value=[])
    appointment.clear_domain_events = MagicMock()
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_appointment_repository.save = AsyncMock()
    
    dto = ConfirmPaymentDto(
        appointment_id=str(appointment_id.value),
        payment_data={
            'amount': 5000.0,
            'providerPaymentId': 'test_payment_id',
            'status': 'succeeded'
        }
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.status == 'confirmed'
    assert result.payment is not None
    mock_appointment_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_confirm_payment_appointment_not_found(use_case, mock_appointment_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    mock_appointment_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = ConfirmPaymentDto(
        appointment_id=str(AppointmentId.generate().value),
        payment_data={
            'amount': 5000.0,
            'providerPaymentId': 'test_payment_id',
            'status': 'succeeded'
        }
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Appointment not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_confirm_payment_failed(use_case, mock_appointment_repository, mock_service_repository):
    """Тест обработки неуспешного платежа."""
    # Arrange
    appointment_id = AppointmentId.generate()
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.service_id = mock_service_repository.find_by_id.return_value.id
    appointment.client_id = None
    appointment.metadata = None
    appointment.assign_payment = MagicMock()
    appointment.get_domain_events = MagicMock(return_value=[])
    appointment.clear_domain_events = MagicMock()
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_appointment_repository.save = AsyncMock()
    
    dto = ConfirmPaymentDto(
        appointment_id=str(appointment_id.value),
        payment_data={
            'amount': 5000.0,
            'providerPaymentId': 'test_payment_id',
            'status': 'failed',
            'failureReason': 'Insufficient funds'
        }
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.status == 'failed'
    appointment.assign_payment.assert_called_once()

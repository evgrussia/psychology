"""
Unit тесты для CancelAppointmentUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.cancel_appointment import CancelAppointmentUseCase
from application.booking.dto import CancelAppointmentDto
from application.exceptions import NotFoundError, ForbiddenError, ValidationError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.role import Role
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
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    # В реальном коде используется role.code == 'admin'
    client_role = MagicMock()
    client_role.code = 'client'
    user.roles = [client_role]
    user.email = MagicMock()
    user.email.value = "test@example.com"
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    return repo


@pytest.fixture
def mock_payment_adapter():
    """Мок адаптера платежей."""
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
    mock_payment_adapter,
    mock_email_service,
    event_bus
):
    """Фикстура для Use Case."""
    return CancelAppointmentUseCase(
        appointment_repository=mock_appointment_repository,
        service_repository=mock_service_repository,
        user_repository=mock_user_repository,
        payment_adapter=mock_payment_adapter,
        event_bus=event_bus,
        email_service=mock_email_service
    )


@pytest.mark.asyncio
async def test_cancel_appointment_success(use_case, mock_appointment_repository, mock_user_repository):
    """Тест успешной отмены записи."""
    # Arrange
    appointment_id = AppointmentId.generate()
    user_id = mock_user_repository.find_by_id.return_value.id
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.client_id = user_id
    appointment.can_be_canceled = MagicMock(return_value=True)
    appointment.cancel = MagicMock(return_value=Money(5000.0, Currency.RUB))
    appointment.payment = MagicMock()
    appointment.payment.amount = Money(5000.0, Currency.RUB)
    appointment.payment.provider_payment_id = "test_payment_id"
    appointment.slot = MagicMock()
    appointment.slot.start_at = datetime.now(timezone.utc)
    appointment.get_domain_events = MagicMock(return_value=[])
    appointment.clear_domain_events = MagicMock()
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_appointment_repository.save = AsyncMock()
    
    dto = CancelAppointmentDto(
        appointment_id=str(appointment_id.value),
        user_id=str(user_id.value),
        reason='client_request'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.status == 'canceled'
    mock_appointment_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_cancel_appointment_not_found(use_case, mock_appointment_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    mock_appointment_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = CancelAppointmentDto(
        appointment_id=str(AppointmentId.generate().value),
        user_id=str(UserId.generate().value),
        reason='client_request'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Appointment not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_cancel_appointment_forbidden(use_case, mock_appointment_repository, mock_user_repository):
    """Тест ошибки при отсутствии прав."""
    # Arrange
    appointment_id = AppointmentId.generate()
    user_id = mock_user_repository.find_by_id.return_value.id
    other_user_id = UserId.generate()
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.client_id = other_user_id  # Другой пользователь
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    
    dto = CancelAppointmentDto(
        appointment_id=str(appointment_id.value),
        user_id=str(user_id.value),
        reason='client_request'
    )
    
    # Act & Assert
    with pytest.raises(ForbiddenError):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_cancel_appointment_cannot_be_canceled(use_case, mock_appointment_repository, mock_user_repository):
    """Тест ошибки при невозможности отмены."""
    # Arrange
    appointment_id = AppointmentId.generate()
    user_id = mock_user_repository.find_by_id.return_value.id
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.client_id = user_id
    appointment.can_be_canceled = MagicMock(return_value=False)
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    
    dto = CancelAppointmentDto(
        appointment_id=str(appointment_id.value),
        user_id=str(user_id.value),
        reason='client_request'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Appointment cannot be canceled"):
        await use_case.execute(dto)

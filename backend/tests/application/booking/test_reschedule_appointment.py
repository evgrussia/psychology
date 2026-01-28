"""
Unit тесты для RescheduleAppointmentUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.reschedule_appointment import RescheduleAppointmentUseCase
from application.booking.dto import RescheduleAppointmentDto
from application.exceptions import NotFoundError, ForbiddenError, ValidationError, ConflictError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
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
    mock_availability_slot_repository,
    mock_slot_availability_service,
    mock_email_service,
    event_bus
):
    """Фикстура для Use Case."""
    return RescheduleAppointmentUseCase(
        appointment_repository=mock_appointment_repository,
        service_repository=mock_service_repository,
        user_repository=mock_user_repository,
        availability_slot_repository=mock_availability_slot_repository,
        slot_availability_service=mock_slot_availability_service,
        event_bus=event_bus,
        email_service=mock_email_service
    )


@pytest.mark.asyncio
async def test_reschedule_appointment_success(use_case, mock_appointment_repository, mock_user_repository):
    """Тест успешного переноса записи."""
    # Arrange
    appointment_id = AppointmentId.generate()
    user_id = mock_user_repository.find_by_id.return_value.id
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.client_id = user_id
    appointment.service_id = ServiceId.generate()
    appointment.status = MagicMock()
    appointment.status.is_confirmed = MagicMock(return_value=True)
    appointment.reschedule = MagicMock()
    appointment.slot = MagicMock()
    appointment.slot.start_at = datetime.now(timezone.utc)
    appointment.slot.end_at = datetime.now(timezone.utc) + timedelta(hours=1)
    appointment.slot.timezone = Timezone('UTC')
    appointment.format = MagicMock()
    appointment.format.value = 'online'
    appointment.metadata = MagicMock()
    appointment.metadata.slot_id = None
    appointment.get_domain_events = MagicMock(return_value=[])
    appointment.clear_domain_events = MagicMock()
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_appointment_repository.save = AsyncMock()
    
    new_start = datetime.now(timezone.utc) + timedelta(days=2)
    new_end = new_start + timedelta(hours=1)
    
    dto = RescheduleAppointmentDto(
        appointment_id=str(appointment_id.value),
        user_id=str(user_id.value),
        new_start_at=new_start.isoformat(),
        new_end_at=new_end.isoformat(),
        timezone='UTC'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.id == str(appointment_id.value)
    mock_appointment_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_reschedule_appointment_not_found(use_case, mock_appointment_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    mock_appointment_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = RescheduleAppointmentDto(
        appointment_id=str(AppointmentId.generate().value),
        user_id=str(UserId.generate().value),
        new_start_at=(datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        new_end_at=(datetime.now(timezone.utc) + timedelta(days=2, hours=1)).isoformat(),
        timezone='UTC'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Appointment not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_reschedule_appointment_forbidden(use_case, mock_appointment_repository, mock_user_repository):
    """Тест ошибки при отсутствии прав."""
    # Arrange
    appointment_id = AppointmentId.generate()
    user_id = mock_user_repository.find_by_id.return_value.id
    other_user_id = UserId.generate()
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.client_id = other_user_id
    appointment.status = MagicMock()
    appointment.status.is_confirmed = MagicMock(return_value=True)
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    
    dto = RescheduleAppointmentDto(
        appointment_id=str(appointment_id.value),
        user_id=str(user_id.value),
        new_start_at=(datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        new_end_at=(datetime.now(timezone.utc) + timedelta(days=2, hours=1)).isoformat(),
        timezone='UTC'
    )
    
    # Act & Assert
    with pytest.raises(ForbiddenError):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_reschedule_appointment_slot_not_available(use_case, mock_appointment_repository, mock_slot_availability_service, mock_user_repository):
    """Тест ошибки при недоступности нового слота."""
    # Arrange
    appointment_id = AppointmentId.generate()
    user_id = mock_user_repository.find_by_id.return_value.id
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.client_id = user_id
    appointment.service_id = ServiceId.generate()
    appointment.status = MagicMock()
    appointment.status.is_confirmed = MagicMock(return_value=True)
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_slot_availability_service.is_slot_available = AsyncMock(return_value=False)
    
    dto = RescheduleAppointmentDto(
        appointment_id=str(appointment_id.value),
        user_id=str(user_id.value),
        new_start_at=(datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        new_end_at=(datetime.now(timezone.utc) + timedelta(days=2, hours=1)).isoformat(),
        timezone='UTC'
    )
    
    # Act & Assert
    with pytest.raises(ConflictError, match="New slot is not available"):
        await use_case.execute(dto)

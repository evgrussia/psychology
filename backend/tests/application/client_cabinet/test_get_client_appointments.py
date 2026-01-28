"""
Unit тесты для GetClientAppointmentsUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.client_cabinet.use_cases.get_client_appointments import GetClientAppointmentsUseCase
from application.client_cabinet.dto import GetClientAppointmentsDto
from application.exceptions import NotFoundError, ForbiddenError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.identity.aggregates.user import User, UserId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.booking.value_objects.appointment_status import AppointmentStatus


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    return repo


@pytest.fixture
def use_case(mock_appointment_repository, mock_user_repository):
    """Фикстура для Use Case."""
    return GetClientAppointmentsUseCase(
        appointment_repository=mock_appointment_repository,
        user_repository=mock_user_repository
    )


@pytest.mark.asyncio
async def test_get_client_appointments_success(use_case, mock_appointment_repository, mock_user_repository):
    """Тест успешного получения списка встреч."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = AppointmentId.generate()
    appointment.service_id = MagicMock()
    appointment.service_id.value = 'service_id'
    appointment.slot = MagicMock()
    appointment.slot.start_at = datetime.now(timezone.utc) + timedelta(days=1)
    appointment.slot.end_at = appointment.slot.start_at + timedelta(hours=1)
    appointment.slot.timezone = Timezone('UTC')
    appointment.status = MagicMock()
    appointment.status.value = 'confirmed'
    appointment.format = MagicMock()
    appointment.format.value = 'online'
    appointment.payment = None
    
    mock_appointment_repository.find_by_client_id = AsyncMock(return_value=[appointment])
    
    dto = GetClientAppointmentsDto(
        user_id=str(user_id.value),
        status='all'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert len(result.appointments) == 1
    mock_appointment_repository.find_by_client_id.assert_called_once()


@pytest.mark.asyncio
async def test_get_client_appointments_user_not_found(use_case, mock_user_repository):
    """Тест ошибки при отсутствии пользователя."""
    # Arrange
    mock_user_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = GetClientAppointmentsDto(
        user_id=str(UserId.generate().value),
        status='all'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="User not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_client_appointments_filter_upcoming(use_case, mock_appointment_repository, mock_user_repository):
    """Тест фильтрации предстоящих встреч."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    
    # Создаем встречу в будущем
    future_appointment = MagicMock(spec=Appointment)
    future_appointment.id = AppointmentId.generate()
    future_appointment.service_id = MagicMock()
    future_appointment.service_id.value = 'service_id'
    future_appointment.slot = MagicMock()
    future_appointment.slot.start_at = datetime.now(timezone.utc) + timedelta(days=1)
    future_appointment.slot.end_at = future_appointment.slot.start_at + timedelta(hours=1)
    future_appointment.slot.timezone = Timezone('UTC')
    future_appointment.status = MagicMock()
    future_appointment.status.value = 'confirmed'
    future_appointment.format = MagicMock()
    future_appointment.format.value = 'online'
    future_appointment.payment = None
    
    # Создаем встречу в прошлом
    past_appointment = MagicMock(spec=Appointment)
    past_appointment.id = AppointmentId.generate()
    past_appointment.service_id = MagicMock()
    past_appointment.service_id.value = 'service_id'
    past_appointment.slot = MagicMock()
    past_appointment.slot.start_at = datetime.now(timezone.utc) - timedelta(days=1)
    past_appointment.slot.end_at = past_appointment.slot.start_at + timedelta(hours=1)
    past_appointment.slot.timezone = Timezone('UTC')
    past_appointment.status = MagicMock()
    past_appointment.status.value = 'completed'
    past_appointment.format = MagicMock()
    past_appointment.format.value = 'online'
    past_appointment.payment = None
    
    mock_appointment_repository.find_by_client_id = AsyncMock(
        return_value=[future_appointment, past_appointment]
    )
    
    dto = GetClientAppointmentsDto(
        user_id=str(user_id.value),
        status='upcoming'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    # Должна остаться только будущая встреча
    assert len(result.appointments) == 1

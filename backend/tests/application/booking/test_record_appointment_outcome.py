"""
Unit тесты для RecordAppointmentOutcomeUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.record_appointment_outcome import RecordAppointmentOutcomeUseCase
from application.booking.dto import RecordAppointmentOutcomeDto
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    return AsyncMock()


@pytest.fixture
def use_case(mock_appointment_repository, mock_user_repository, event_bus):
    """Фикстура для Use Case."""
    return RecordAppointmentOutcomeUseCase(
        appointment_repository=mock_appointment_repository,
        user_repository=mock_user_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_record_appointment_outcome_success(use_case, mock_appointment_repository):
    """Тест успешной записи исхода встречи."""
    # Arrange
    appointment_id = AppointmentId.generate()
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.slot = MagicMock()
    appointment.slot.start_at = datetime.now(timezone.utc) - timedelta(hours=2)  # Встреча уже прошла
    appointment.slot.is_in_past = MagicMock(return_value=True)
    appointment.record_outcome = MagicMock()
    appointment.status = MagicMock()
    appointment.status.value = 'completed'
    appointment.get_domain_events = MagicMock(return_value=[])
    appointment.clear_domain_events = MagicMock()
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_appointment_repository.save = AsyncMock()
    
    dto = RecordAppointmentOutcomeDto(
        appointment_id=str(appointment_id.value),
        outcome='attended',
        notes='Встреча прошла успешно'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    appointment.record_outcome.assert_called_once()
    mock_appointment_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_record_appointment_outcome_not_found(use_case, mock_appointment_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    mock_appointment_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = RecordAppointmentOutcomeDto(
        appointment_id=str(AppointmentId.generate().value),
        outcome='attended'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Appointment not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_record_appointment_outcome_not_passed(use_case, mock_appointment_repository):
    """Тест ошибки при попытке записать исход для будущей встречи."""
    # Arrange
    appointment_id = AppointmentId.generate()
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.slot = MagicMock()
    appointment.slot.start_at = datetime.now(timezone.utc) + timedelta(days=1)  # Встреча в будущем
    appointment.slot.is_in_past = MagicMock(return_value=False)
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    
    dto = RecordAppointmentOutcomeDto(
        appointment_id=str(appointment_id.value),
        outcome='attended'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Cannot record outcome for future appointment"):
        await use_case.execute(dto)

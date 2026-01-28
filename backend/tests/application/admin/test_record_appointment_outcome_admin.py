"""
Unit тесты для RecordAppointmentOutcomeAdminUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.admin.use_cases.record_appointment_outcome_admin import RecordAppointmentOutcomeAdminUseCase
from application.booking.dto import RecordAppointmentOutcomeDto
from application.exceptions import NotFoundError, ValidationError, ForbiddenError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.role import Role
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    admin_user = MagicMock(spec=User)
    admin_user.id = UserId.generate()
    # OWNER имеет admin scope, но в коде проверяется role.code == 'admin'
    # Для теста создаем роль с code='admin' через мок
    admin_role = MagicMock()
    admin_role.code = 'admin'
    admin_user.roles = [admin_role]
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=admin_user)
    return repo


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_appointment_repository, mock_user_repository, event_bus):
    """Фикстура для Use Case."""
    return RecordAppointmentOutcomeAdminUseCase(
        appointment_repository=mock_appointment_repository,
        user_repository=mock_user_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_record_appointment_outcome_admin_success(use_case, mock_appointment_repository, mock_user_repository):
    """Тест успешной записи исхода администратором."""
    # Arrange
    appointment_id = AppointmentId.generate()
    admin_id = mock_user_repository.find_by_id.return_value.id
    
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.slot = MagicMock()
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
        outcome='attended'
    )
    
    # Act
    result = await use_case.execute(dto, str(admin_id.value))
    
    # Assert
    assert result is not None
    assert result['outcome'] == 'attended'
    assert result['recorded_by'] == str(admin_id.value)
    appointment.record_outcome.assert_called_once()
    mock_appointment_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_record_appointment_outcome_admin_not_admin(use_case, mock_user_repository):
    """Тест ошибки при отсутствии прав администратора."""
    # Arrange
    user = mock_user_repository.find_by_id.return_value
    client_role = MagicMock()
    client_role.code = 'client'  # Не админ
    user.roles = [client_role]
    
    dto = RecordAppointmentOutcomeDto(
        appointment_id=str(AppointmentId.generate().value),
        outcome='attended'
    )
    
    # Act & Assert
    with pytest.raises(ForbiddenError, match="Only administrators can record"):
        await use_case.execute(dto, str(user.id.value))


@pytest.mark.asyncio
async def test_record_appointment_outcome_admin_appointment_not_found(use_case, mock_appointment_repository, mock_user_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    admin_id = mock_user_repository.find_by_id.return_value.id
    mock_appointment_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = RecordAppointmentOutcomeDto(
        appointment_id=str(AppointmentId.generate().value),
        outcome='attended'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Appointment not found"):
        await use_case.execute(dto, str(admin_id.value))

"""
Unit тесты для DeleteUserDataUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.client_cabinet.use_cases.delete_user_data import DeleteUserDataUseCase
from application.client_cabinet.dto import DeleteUserDataDto
from application.exceptions import NotFoundError, ValidationError
from domain.identity.aggregates.user import User, UserId
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    user.delete = MagicMock()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    repo.save = AsyncMock()
    return repo


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_diary_repository():
    """Мок репозитория дневников."""
    entry = MagicMock(spec=DiaryEntry)
    entry.id = DiaryEntryId.generate()
    
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=[entry])
    repo.delete = AsyncMock()
    return repo


@pytest.fixture
def mock_interactive_run_repository():
    """Мок репозитория интерактивов."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_user_repository,
    mock_appointment_repository,
    mock_diary_repository,
    mock_interactive_run_repository,
    event_bus
):
    """Фикстура для Use Case."""
    return DeleteUserDataUseCase(
        user_repository=mock_user_repository,
        appointment_repository=mock_appointment_repository,
        diary_entry_repository=mock_diary_repository,
        interactive_run_repository=mock_interactive_run_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_delete_user_data_success(use_case, mock_user_repository, mock_diary_repository):
    """Тест успешного удаления данных пользователя."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    
    dto = DeleteUserDataDto(
        user_id=str(user_id.value),
        confirmation='DELETE'
    )
    
    mock_appointment_repository.find_by_client_id = AsyncMock(return_value=[])
    mock_interactive_run_repository.find_by_user_id = AsyncMock(return_value=[])
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['status'] == 'deleted'
    mock_user_repository.find_by_id.return_value.delete.assert_called_once()
    mock_user_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_delete_user_data_invalid_confirmation(use_case):
    """Тест валидации подтверждения."""
    # Arrange
    dto = DeleteUserDataDto(
        user_id=str(UserId.generate().value),
        confirmation='INVALID'  # Неверное подтверждение
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Confirmation must be exactly 'DELETE'"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_delete_user_data_user_not_found(use_case, mock_user_repository):
    """Тест ошибки при отсутствии пользователя."""
    # Arrange
    mock_user_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = DeleteUserDataDto(
        user_id=str(UserId.generate().value),
        confirmation='DELETE'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="User not found"):
        await use_case.execute(dto)

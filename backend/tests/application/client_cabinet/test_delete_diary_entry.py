"""
Unit тесты для DeleteDiaryEntryUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.client_cabinet.use_cases.delete_diary_entry import DeleteDiaryEntryUseCase
from application.exceptions import NotFoundError, ForbiddenError
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.identity.aggregates.user import User, UserId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_diary_repository():
    """Мок репозитория дневников."""
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
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_diary_repository, mock_user_repository, event_bus):
    """Фикстура для Use Case."""
    return DeleteDiaryEntryUseCase(
        diary_entry_repository=mock_diary_repository,
        user_repository=mock_user_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_delete_diary_entry_success(use_case, mock_diary_repository, mock_user_repository):
    """Тест успешного удаления записи дневника."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    entry_id = DiaryEntryId.generate()
    
    entry = MagicMock(spec=DiaryEntry)
    entry.id = entry_id
    entry.user_id = user_id
    
    mock_diary_repository.find_by_id = AsyncMock(return_value=entry)
    mock_diary_repository.delete = AsyncMock()
    
    # Act
    result = await use_case.execute(str(entry_id.value), str(user_id.value))
    
    # Assert
    assert result is not None
    mock_diary_repository.delete.assert_called_once()


@pytest.mark.asyncio
async def test_delete_diary_entry_not_found(use_case, mock_diary_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    mock_diary_repository.find_by_id = AsyncMock(return_value=None)
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Diary entry not found"):
        await use_case.execute(str(DiaryEntryId.generate().value), str(UserId.generate().value))


@pytest.mark.asyncio
async def test_delete_diary_entry_forbidden(use_case, mock_diary_repository, mock_user_repository):
    """Тест ошибки при отсутствии прав."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    other_user_id = UserId.generate()
    entry_id = DiaryEntryId.generate()
    
    entry = MagicMock(spec=DiaryEntry)
    entry.id = entry_id
    entry.user_id = other_user_id  # Другой пользователь
    
    mock_diary_repository.find_by_id = AsyncMock(return_value=entry)
    
    # Act & Assert
    with pytest.raises(ForbiddenError, match="You don't have permission"):
        await use_case.execute(str(entry_id.value), str(user_id.value))

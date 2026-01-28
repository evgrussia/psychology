"""
Unit тесты для CreateDiaryEntryUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.client_cabinet.use_cases.create_diary_entry import CreateDiaryEntryUseCase
from application.client_cabinet.dto import CreateDiaryEntryDto
from application.exceptions import ValidationError, ForbiddenError
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
def mock_encryption_service():
    """Мок сервиса шифрования."""
    service = MagicMock()
    service.encrypt = MagicMock(return_value='encrypted_content')
    return service


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_diary_repository,
    mock_user_repository,
    mock_encryption_service,
    event_bus
):
    """Фикстура для Use Case."""
    return CreateDiaryEntryUseCase(
        diary_entry_repository=mock_diary_repository,
        user_repository=mock_user_repository,
        encryption_service=mock_encryption_service,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_create_diary_entry_success(use_case, mock_diary_repository, mock_user_repository, mock_encryption_service):
    """Тест успешного создания записи дневника."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    
    dto = CreateDiaryEntryDto(
        user_id=str(user_id.value),
        type='mood',
        content={'mood': 'calm', 'notes': 'Feeling good today'}
    )
    
    mock_diary_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.id is not None
    assert result.type == 'mood'
    assert result.content == dto.content
    mock_diary_repository.save.assert_called_once()
    mock_encryption_service.encrypt.assert_called_once()


@pytest.mark.asyncio
async def test_create_diary_entry_user_not_found(use_case, mock_user_repository):
    """Тест ошибки при отсутствии пользователя."""
    # Arrange
    mock_user_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = CreateDiaryEntryDto(
        user_id=str(UserId.generate().value),
        type='mood',
        content={'mood': 'calm'}
    )
    
    # Act & Assert
    with pytest.raises(ForbiddenError, match="User not found"):
        await use_case.execute(dto)

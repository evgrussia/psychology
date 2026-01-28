"""
Unit тесты для ModerateUGCItemUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.admin.use_cases.moderate_ugc_item import ModerateUGCItemUseCase
from application.admin.dto import ModerateUGCItemDto
from application.exceptions import NotFoundError, ValidationError
from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.identity.aggregates.user import UserId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_moderation_repository():
    """Мок репозитория модерации."""
    item = MagicMock(spec=ModerationItem)
    item.id = ModerationItemId.generate()
    item.status = MagicMock()
    item.status.value = 'pending'
    item.moderate = MagicMock()
    item.get_domain_events = MagicMock(return_value=[])
    item.clear_domain_events = MagicMock()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=item)
    repo.save = AsyncMock()
    return repo


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_moderation_repository, event_bus):
    """Фикстура для Use Case."""
    return ModerateUGCItemUseCase(
        moderation_repository=mock_moderation_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_moderate_ugc_item_approve_success(use_case, mock_moderation_repository):
    """Тест успешного одобрения UGC."""
    # Arrange
    item_id = mock_moderation_repository.find_by_id.return_value.id
    
    dto = ModerateUGCItemDto(
        item_id=str(item_id.value),
        moderator_id=str(UserId.generate().value),
        decision='approve'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['decision'] == 'approve'
    mock_moderation_repository.find_by_id.return_value.moderate.assert_called_once()
    mock_moderation_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_moderate_ugc_item_reject_success(use_case, mock_moderation_repository):
    """Тест успешного отклонения UGC."""
    # Arrange
    item_id = mock_moderation_repository.find_by_id.return_value.id
    
    dto = ModerateUGCItemDto(
        item_id=str(item_id.value),
        moderator_id=str(UserId.generate().value),
        decision='reject'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['decision'] == 'reject'
    mock_moderation_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_moderate_ugc_item_not_found(use_case, mock_moderation_repository):
    """Тест ошибки при отсутствии элемента."""
    # Arrange
    mock_moderation_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = ModerateUGCItemDto(
        item_id=str(ModerationItemId.generate().value),
        moderator_id=str(UserId.generate().value),
        decision='approve'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Moderation item not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_moderate_ugc_item_invalid_decision(use_case, mock_moderation_repository):
    """Тест валидации решения."""
    # Arrange
    item_id = mock_moderation_repository.find_by_id.return_value.id
    
    dto = ModerateUGCItemDto(
        item_id=str(item_id.value),
        moderator_id=str(UserId.generate().value),
        decision='invalid_decision'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Invalid decision"):
        await use_case.execute(dto)

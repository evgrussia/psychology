"""
Unit тесты для PublishContentItemUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.admin.use_cases.publish_content_item import PublishContentItemUseCase
from application.admin.dto import PublishContentItemDto
from application.exceptions import NotFoundError, ValidationError
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_status import ContentStatus


@pytest.fixture
def mock_content_repository():
    """Мок репозитория контента."""
    content = MagicMock(spec=ContentItem)
    content.id = ContentItemId.generate()
    content.publish = MagicMock()
    content.published_at = None
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=content)
    repo.save = AsyncMock()
    return repo


@pytest.fixture
def use_case(mock_content_repository):
    """Фикстура для Use Case."""
    return PublishContentItemUseCase(content_repository=mock_content_repository)


@pytest.mark.asyncio
async def test_publish_content_item_success(use_case, mock_content_repository):
    """Тест успешной публикации контента."""
    # Arrange
    content_id = mock_content_repository.find_by_id.return_value.id
    
    dto = PublishContentItemDto(
        content_id=str(content_id.value),
        checklist={
            'hasDisclaimers': True,
            'toneChecked': True,
            'hasCta': True,
            'hasInternalLinks': True
        }
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['status'] == 'published'
    mock_content_repository.find_by_id.return_value.publish.assert_called_once()
    mock_content_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_publish_content_item_not_found(use_case, mock_content_repository):
    """Тест ошибки при отсутствии контента."""
    # Arrange
    mock_content_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = PublishContentItemDto(
        content_id=str(ContentItemId.generate().value),
        checklist={
            'hasDisclaimers': True,
            'toneChecked': True,
            'hasCta': True,
            'hasInternalLinks': True
        }
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Content item not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_publish_content_item_checklist_incomplete(use_case, mock_content_repository):
    """Тест валидации чеклиста."""
    # Arrange
    content_id = mock_content_repository.find_by_id.return_value.id
    
    dto = PublishContentItemDto(
        content_id=str(content_id.value),
        checklist={
            'hasDisclaimers': True,
            'toneChecked': False,  # Не все пункты выполнены
            'hasCta': True,
            'hasInternalLinks': True
        }
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="All checklist items must be completed"):
        await use_case.execute(dto)

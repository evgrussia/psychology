"""
Unit тесты для GetResourceUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.content.use_cases.get_resource import GetResourceUseCase
from application.content.dto import GetResourceDto
from application.exceptions import NotFoundError
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_status import ContentStatus
from domain.content.value_objects.content_type import ContentType


@pytest.fixture
def mock_content_repository():
    """Мок репозитория контента."""
    resource = MagicMock(spec=ContentItem)
    resource.id = ContentItemId.generate()
    resource.slug = "breathing-exercise"
    resource.title = "Breathing Exercise"
    resource.content_type = ContentType('exercise')
    resource.status = ContentStatus.PUBLISHED
    
    repo = AsyncMock()
    repo.find_by_slug = AsyncMock(return_value=resource)
    repo.find_related_resources = AsyncMock(return_value=[])
    return repo


@pytest.fixture
def use_case(mock_content_repository):
    """Фикстура для Use Case."""
    return GetResourceUseCase(content_repository=mock_content_repository)


@pytest.mark.asyncio
async def test_get_resource_success(use_case, mock_content_repository):
    """Тест успешного получения ресурса."""
    # Arrange
    dto = GetResourceDto(slug='breathing-exercise')
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.slug == 'breathing-exercise'
    assert result.type is not None
    mock_content_repository.find_by_slug.assert_called()


@pytest.mark.asyncio
async def test_get_resource_not_found(use_case, mock_content_repository):
    """Тест ошибки при отсутствии ресурса."""
    # Arrange
    mock_content_repository.find_by_slug = AsyncMock(return_value=None)
    
    dto = GetResourceDto(slug='nonexistent-resource')
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Resource not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_resource_not_published(use_case, mock_content_repository):
    """Тест ошибки при неопубликованном ресурсе."""
    # Arrange
    resource = mock_content_repository.find_by_slug.return_value
    resource.status = ContentStatus.DRAFT
    
    dto = GetResourceDto(slug='breathing-exercise')
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Resource is not published"):
        await use_case.execute(dto)

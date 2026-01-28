"""
Unit тесты для GetRitualUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.interactive.use_cases.get_ritual import GetRitualUseCase
from application.interactive.dto import GetRitualDto
from application.exceptions import NotFoundError
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus


@pytest.fixture
def mock_content_repository():
    """Мок репозитория контента."""
    ritual = MagicMock(spec=ContentItem)
    ritual.id = ContentItemId.generate()
    ritual.title = "Дыхательное упражнение 4-7-8"
    ritual.status = ContentStatus.PUBLISHED
    ritual.content_body = '{"description": "Техника дыхания", "duration_minutes": 10, "instructions": ["Шаг 1", "Шаг 2"]}'
    
    repo = AsyncMock()
    repo.find_by_slug = AsyncMock(return_value=ritual)
    repo.find_by_id = AsyncMock(return_value=ritual)
    return repo


@pytest.fixture
def use_case(mock_content_repository):
    """Фикстура для Use Case."""
    return GetRitualUseCase(content_repository=mock_content_repository)


@pytest.mark.asyncio
async def test_get_ritual_success(use_case, mock_content_repository):
    """Тест успешного получения ритуала."""
    # Arrange
    dto = GetRitualDto(ritual_id='breathing-478')
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.id is not None
    assert result.title is not None
    assert result.duration_minutes is not None
    mock_content_repository.find_by_slug.assert_called_once()


@pytest.mark.asyncio
async def test_get_ritual_not_found(use_case, mock_content_repository):
    """Тест ошибки при отсутствии ритуала."""
    # Arrange
    mock_content_repository.find_by_slug = AsyncMock(return_value=None)
    mock_content_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = GetRitualDto(ritual_id='nonexistent-ritual')
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Ritual not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_ritual_not_published(use_case, mock_content_repository):
    """Тест ошибки при неопубликованном ритуале."""
    # Arrange
    ritual = mock_content_repository.find_by_slug.return_value
    ritual.status = ContentStatus.DRAFT
    
    dto = GetRitualDto(ritual_id='breathing-478')
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Ritual is not published"):
        await use_case.execute(dto)

"""
Unit тесты для ListArticlesUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.content.use_cases.list_articles import ListArticlesUseCase
from application.content.dto import ListArticlesDto
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_type import ContentType
from domain.content.value_objects.content_status import ContentStatus
from domain.content.value_objects.topic_code import TopicCode


@pytest.fixture
def mock_content_repository():
    """Мок репозитория контента."""
    repo = AsyncMock()
    
    # Мок для find_published
    article = MagicMock(spec=ContentItem)
    article.id = ContentItemId.generate()
    article.slug = "test-article"
    article.title = "Test Article"
    article.excerpt = "Test excerpt"
    article.published_at = None
    article.category = None
    article.tags = []
    
    repo.find_published = AsyncMock(return_value=[article])
    repo.count_published = AsyncMock(return_value=1)
    
    return repo


@pytest.fixture
def use_case(mock_content_repository):
    """Фикстура для Use Case."""
    return ListArticlesUseCase(content_repository=mock_content_repository)


@pytest.mark.asyncio
async def test_list_articles_success(use_case, mock_content_repository):
    """Тест успешного получения списка статей."""
    # Arrange
    dto = ListArticlesDto(page=1, per_page=20)
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.data is not None
    assert len(result.data) == 1
    assert result.pagination['page'] == 1
    assert result.pagination['total'] == 1
    mock_content_repository.find_published.assert_called_once()
    mock_content_repository.count_published.assert_called_once()


@pytest.mark.asyncio
async def test_list_articles_invalid_page(use_case):
    """Тест валидации номера страницы."""
    # Arrange
    dto = ListArticlesDto(page=0, per_page=20)
    
    # Act & Assert
    with pytest.raises(Exception):  # ValidationError
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_list_articles_invalid_per_page(use_case):
    """Тест валидации количества на странице."""
    # Arrange
    dto = ListArticlesDto(page=1, per_page=0)
    
    # Act & Assert
    with pytest.raises(Exception):  # ValidationError
        await use_case.execute(dto)

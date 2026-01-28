"""
Unit тесты для GetArticleUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.content.use_cases.get_article import GetArticleUseCase
from application.content.dto import GetArticleDto
from application.exceptions import NotFoundError, ForbiddenError
from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects.content_status import ContentStatus


@pytest.fixture
def mock_content_repository():
    """Мок репозитория контента."""
    article = MagicMock(spec=ContentItem)
    article.id = ContentItemId.generate()
    article.slug = "test-article"
    article.title = "Test Article"
    article.status = ContentStatus.PUBLISHED
    article.published_at = None
    article.tags = []
    
    repo = AsyncMock()
    repo.find_by_slug = AsyncMock(return_value=article)
    repo.find_related_resources = AsyncMock(return_value=[])
    return repo


@pytest.fixture
def use_case(mock_content_repository):
    """Фикстура для Use Case."""
    return GetArticleUseCase(content_repository=mock_content_repository)


@pytest.mark.asyncio
async def test_get_article_success(use_case, mock_content_repository):
    """Тест успешного получения статьи."""
    # Arrange
    dto = GetArticleDto(slug='test-article', include_draft=False)
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.slug == 'test-article'
    assert result.title is not None
    mock_content_repository.find_by_slug.assert_called_once()
    mock_content_repository.find_related_resources.assert_called_once()


@pytest.mark.asyncio
async def test_get_article_not_found(use_case, mock_content_repository):
    """Тест ошибки при отсутствии статьи."""
    # Arrange
    mock_content_repository.find_by_slug = AsyncMock(return_value=None)
    
    dto = GetArticleDto(slug='nonexistent-article', include_draft=False)
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Article not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_article_not_published(use_case, mock_content_repository):
    """Тест ошибки при неопубликованной статье."""
    # Arrange
    article = mock_content_repository.find_by_slug.return_value
    article.status = ContentStatus.DRAFT
    
    dto = GetArticleDto(slug='test-article', include_draft=False)
    
    # Act & Assert
    with pytest.raises(ForbiddenError, match="Article is not published"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_article_draft_allowed(use_case, mock_content_repository):
    """Тест получения черновика с разрешением."""
    # Arrange
    article = mock_content_repository.find_by_slug.return_value
    article.status = ContentStatus.DRAFT
    
    dto = GetArticleDto(slug='test-article', include_draft=True)
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.slug == 'test-article'

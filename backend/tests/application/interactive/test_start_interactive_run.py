"""
Unit тесты для StartInteractiveRunUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.interactive.use_cases.start_interactive_run import StartInteractiveRunUseCase
from application.interactive.dto import StartInteractiveRunDto
from application.exceptions import NotFoundError, ValidationError
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_definition_repository():
    """Мок репозитория определений интерактивов."""
    definition = {
        'id': 'test_definition_id',
        'slug': 'test-quiz',
        'title': 'Test Quiz',
        'interactive_type': 'quiz',
        'status': 'published',
        'questions': [],
        'steps': []
    }
    
    repo = AsyncMock()
    repo.find_by_slug = AsyncMock(return_value=definition)
    return repo


@pytest.fixture
def mock_run_repository():
    """Мок репозитория прохождений."""
    return AsyncMock()


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_definition_repository,
    mock_run_repository,
    mock_lead_repository,
    event_bus
):
    """Фикстура для Use Case."""
    return StartInteractiveRunUseCase(
        interactive_definition_repository=mock_definition_repository,
        interactive_run_repository=mock_run_repository,
        lead_repository=mock_lead_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_start_interactive_run_success(use_case, mock_definition_repository, mock_run_repository):
    """Тест успешного начала прохождения интерактива."""
    # Arrange
    dto = StartInteractiveRunDto(
        interactive_slug='test-quiz',
        user_id=None,
        anonymous_id='test_anonymous_id',
        metadata={}
    )
    
    mock_run_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.run_id is not None
    assert result.interactive is not None
    mock_run_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_start_interactive_run_not_found(use_case, mock_definition_repository):
    """Тест ошибки при отсутствии интерактива."""
    # Arrange
    mock_definition_repository.find_by_slug = AsyncMock(return_value=None)
    
    dto = StartInteractiveRunDto(
        interactive_slug='nonexistent-quiz',
        user_id=None,
        anonymous_id='test_anonymous_id',
        metadata={}
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Interactive not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_start_interactive_run_not_published(use_case, mock_definition_repository):
    """Тест ошибки при неопубликованном интерактиве."""
    # Arrange
    definition = mock_definition_repository.find_by_slug.return_value
    definition['status'] = 'draft'
    
    dto = StartInteractiveRunDto(
        interactive_slug='test-quiz',
        user_id=None,
        anonymous_id='test_anonymous_id',
        metadata={}
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Interactive is not published"):
        await use_case.execute(dto)

"""
Unit тесты для CompleteInteractiveRunUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.interactive.use_cases.complete_interactive_run import CompleteInteractiveRunUseCase
from application.interactive.dto import CompleteInteractiveRunDto
from application.exceptions import NotFoundError, ValidationError
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.interactive.value_objects.run_status import RunStatus
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_run_repository():
    """Мок репозитория прохождений."""
    return AsyncMock()


@pytest.fixture
def mock_definition_repository():
    """Мок репозитория определений."""
    definition = MagicMock()
    definition.id = 'test_definition_id'
    definition.slug = 'test-quiz'
    
    repo = AsyncMock()
    repo.find_by_slug = AsyncMock(return_value=definition)
    return repo


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
    mock_run_repository,
    mock_definition_repository,
    mock_lead_repository,
    event_bus
):
    """Фикстура для Use Case."""
    return CompleteInteractiveRunUseCase(
        interactive_run_repository=mock_run_repository,
        interactive_definition_repository=mock_definition_repository,
        lead_repository=mock_lead_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_complete_interactive_run_success(use_case, mock_run_repository, mock_definition_repository):
    """Тест успешного завершения интерактива."""
    # Arrange
    run_id = InteractiveRunId.generate()
    run = MagicMock(spec=InteractiveRun)
    run.id = run_id
    run.status = MagicMock()
    run.status.value = 'started'
    run.metadata = MagicMock()
    run.metadata.interactive_slug = 'test-quiz'
    run.metadata.deep_link_id = None
    run.complete = MagicMock()
    run.get_domain_events = MagicMock(return_value=[])
    run.clear_domain_events = MagicMock()
    
    mock_run_repository.find_by_id = AsyncMock(return_value=run)
    mock_run_repository.save = AsyncMock()
    
    dto = CompleteInteractiveRunDto(
        run_id=str(run_id.value),
        answers=[{'question_id': 'q1', 'value': 3}],
        thermometer_values=None,
        navigator_path=None,
        crisis_triggered=False
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.run_id == str(run_id.value)
    assert result.result is not None
    run.complete.assert_called_once()
    mock_run_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_complete_interactive_run_not_found(use_case, mock_run_repository):
    """Тест ошибки при отсутствии прохождения."""
    # Arrange
    mock_run_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = CompleteInteractiveRunDto(
        run_id=str(InteractiveRunId.generate().value),
        answers=[]
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Interactive run not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_complete_interactive_run_already_completed(use_case, mock_run_repository):
    """Тест ошибки при попытке завершить уже завершенный интерактив."""
    # Arrange
    run_id = InteractiveRunId.generate()
    run = MagicMock(spec=InteractiveRun)
    run.id = run_id
    run.status = MagicMock()
    run.status.value = 'completed'  # Уже завершен
    
    mock_run_repository.find_by_id = AsyncMock(return_value=run)
    
    dto = CompleteInteractiveRunDto(
        run_id=str(run_id.value),
        answers=[]
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Can only complete started run"):
        await use_case.execute(dto)

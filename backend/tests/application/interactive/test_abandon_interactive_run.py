"""
Unit тесты для AbandonInteractiveRunUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.interactive.use_cases.abandon_interactive_run import AbandonInteractiveRunUseCase
from application.exceptions import NotFoundError, ValidationError
from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_run_repository():
    """Мок репозитория прохождений."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_run_repository, event_bus):
    """Фикстура для Use Case."""
    return AbandonInteractiveRunUseCase(
        interactive_run_repository=mock_run_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_abandon_interactive_run_success(use_case, mock_run_repository):
    """Тест успешной отметки интерактива как заброшенного."""
    # Arrange
    run_id = InteractiveRunId.generate()
    run = MagicMock(spec=InteractiveRun)
    run.id = run_id
    run.abandon = MagicMock()
    run.get_domain_events = MagicMock(return_value=[])
    run.clear_domain_events = MagicMock()
    
    mock_run_repository.find_by_id = AsyncMock(return_value=run)
    mock_run_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(str(run_id.value))
    
    # Assert
    assert result is not None
    assert result['status'] == 'abandoned'
    run.abandon.assert_called_once()
    mock_run_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_abandon_interactive_run_not_found(use_case, mock_run_repository):
    """Тест ошибки при отсутствии прохождения."""
    # Arrange
    mock_run_repository.find_by_id = AsyncMock(return_value=None)
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Interactive run not found"):
        await use_case.execute(str(InteractiveRunId.generate().value))


@pytest.mark.asyncio
async def test_abandon_interactive_run_already_completed(use_case, mock_run_repository):
    """Тест ошибки при попытке забросить уже завершенный интерактив."""
    # Arrange
    run_id = InteractiveRunId.generate()
    run = MagicMock(spec=InteractiveRun)
    run.id = run_id
    run.abandon = MagicMock(side_effect=ValueError("Cannot abandon completed run"))
    
    mock_run_repository.find_by_id = AsyncMock(return_value=run)
    
    # Act & Assert
    with pytest.raises(ValidationError):
        await use_case.execute(str(run_id.value))

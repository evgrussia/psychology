"""
Unit тесты для SendTelegramPlanUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.telegram.use_cases.send_telegram_plan import SendTelegramPlanUseCase
from application.telegram.dto import SendTelegramPlanDto
from domain.analytics.aggregates.lead import Lead, LeadId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_telegram_adapter():
    """Мок адаптера Telegram."""
    adapter = AsyncMock()
    adapter.send_plan = AsyncMock()
    return adapter


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    lead = MagicMock(spec=Lead)
    lead.id = LeadId.generate()
    lead.add_timeline_event = MagicMock()
    
    repo = AsyncMock()
    repo.find_by_deep_link_id = AsyncMock(return_value=lead)
    repo.save = AsyncMock()
    return repo


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_telegram_adapter, mock_lead_repository, event_bus):
    """Фикстура для Use Case."""
    return SendTelegramPlanUseCase(
        telegram_adapter=mock_telegram_adapter,
        lead_repository=mock_lead_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_send_telegram_plan_success(use_case, mock_telegram_adapter, mock_lead_repository):
    """Тест успешной отправки плана."""
    # Arrange
    dto = SendTelegramPlanDto(
        telegram_user_id='123456789',
        topic_code='anxiety',
        deep_link_id='test_deep_link_id'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['success'] is True
    assert result['topic_code'] == 'anxiety'
    mock_telegram_adapter.send_plan.assert_called_once()
    mock_lead_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_send_telegram_plan_without_deep_link(use_case, mock_telegram_adapter, mock_lead_repository):
    """Тест отправки плана без deep_link_id."""
    # Arrange
    dto = SendTelegramPlanDto(
        telegram_user_id='123456789',
        topic_code='anxiety',
        deep_link_id=None
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['success'] is True
    mock_telegram_adapter.send_plan.assert_called_once()
    # Lead не должен обновляться, если нет deep_link_id
    mock_lead_repository.find_by_deep_link_id.assert_not_called()

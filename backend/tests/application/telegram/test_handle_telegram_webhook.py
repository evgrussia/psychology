"""
Unit тесты для HandleTelegramWebhookUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.telegram.use_cases.handle_telegram_webhook import HandleTelegramWebhookUseCase
from application.telegram.dto import TelegramWebhookDto
from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_identity import LeadIdentity
from domain.analytics.value_objects.lead_status import LeadStatus
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_telegram_adapter():
    """Мок адаптера Telegram."""
    adapter = AsyncMock()
    adapter.send_welcome_message = AsyncMock()
    adapter.send_message = AsyncMock()
    adapter.answer_callback_query = AsyncMock()
    return adapter


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_telegram_adapter, mock_lead_repository, event_bus):
    """Фикстура для Use Case."""
    return HandleTelegramWebhookUseCase(
        telegram_adapter=mock_telegram_adapter,
        lead_repository=mock_lead_repository,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_handle_telegram_webhook_start_command(use_case, mock_telegram_adapter, mock_lead_repository):
    """Тест обработки команды /start."""
    # Arrange
    dto = TelegramWebhookDto(
        update={
            'message': {
                'chat': {'id': 123456789},
                'text': '/start test_deep_link_id',
                'from': {
                    'id': 123456789,
                    'username': 'testuser'
                }
            }
        }
    )
    
    mock_lead_repository.find_by_deep_link_id = AsyncMock(return_value=None)
    mock_lead_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['success'] is True
    assert result['action'] == 'welcome_sent'
    mock_telegram_adapter.send_welcome_message.assert_called_once()


@pytest.mark.asyncio
async def test_handle_telegram_webhook_stop_command(use_case, mock_telegram_adapter, mock_lead_repository):
    """Тест обработки команды /stop."""
    # Arrange
    dto = TelegramWebhookDto(
        update={
            'message': {
                'chat': {'id': 123456789},
                'text': '/stop',
                'from': {
                    'id': 123456789,
                    'username': 'testuser'
                }
            }
        }
    )
    
    # Мокаем поиск Lead
    mock_lead_repository.find_by_status = AsyncMock(return_value=[])
    mock_lead_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['success'] is True
    assert result['action'] == 'unsubscribed'
    mock_telegram_adapter.send_message.assert_called_once()


@pytest.mark.asyncio
async def test_handle_telegram_webhook_callback_query(use_case, mock_telegram_adapter, mock_lead_repository):
    """Тест обработки callback query."""
    # Arrange
    dto = TelegramWebhookDto(
        update={
            'callback_query': {
                'id': 'callback_query_id',
                'data': 'select_topic:anxiety',
                'from': {
                    'id': 123456789
                },
                'message': {
                    'chat': {'id': 123456789}
                }
            }
        }
    )
    
    mock_lead_repository.find_by_status = AsyncMock(return_value=[])
    mock_lead_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['success'] is True
    assert result['action'] == 'topic_selected'
    mock_telegram_adapter.answer_callback_query.assert_called_once()

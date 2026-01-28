"""
Unit тесты для HandlePaymentWebhookUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.payments.use_cases.handle_payment_webhook import HandlePaymentWebhookUseCase
from application.payments.dto import PaymentWebhookDto
from application.exceptions import UnauthorizedError, NotFoundError
from domain.payments.aggregates.payment import Payment, PaymentId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_payment_repository():
    """Мок репозитория платежей."""
    return AsyncMock()


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_payment_adapter():
    """Мок адаптера платежей."""
    adapter = AsyncMock()
    adapter.verify_webhook_signature = MagicMock(return_value=True)
    return adapter


@pytest.fixture
def mock_confirm_payment_use_case():
    """Мок Use Case подтверждения оплаты."""
    return AsyncMock()


@pytest.fixture
def mock_webhook_repository():
    """Мок репозитория webhook событий."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_payment_repository,
    mock_appointment_repository,
    mock_payment_adapter,
    mock_confirm_payment_use_case,
    event_bus,
    mock_webhook_repository
):
    """Фикстура для Use Case."""
    return HandlePaymentWebhookUseCase(
        payment_repository=mock_payment_repository,
        appointment_repository=mock_appointment_repository,
        payment_adapter=mock_payment_adapter,
        event_bus=event_bus,
        confirm_payment_use_case=mock_confirm_payment_use_case,
        webhook_repository=mock_webhook_repository
    )


@pytest.mark.asyncio
async def test_handle_payment_webhook_success(use_case, mock_payment_repository, mock_payment_adapter, mock_webhook_repository):
    """Тест успешной обработки webhook."""
    # Arrange
    payment_id = PaymentId.generate()
    payment = MagicMock(spec=Payment)
    payment.id = payment_id
    payment.status = MagicMock()
    payment.status.value = 'pending'
    payment.mark_as_succeeded = MagicMock()
    payment.amount = Money(5000.0, Currency.RUB)
    payment.get_domain_events = MagicMock(return_value=[])
    payment.clear_domain_events = MagicMock()
    
    mock_payment_repository.find_by_provider_payment_id = AsyncMock(return_value=payment)
    mock_payment_repository.save = AsyncMock()
    mock_webhook_repository.is_processed = AsyncMock(return_value=False)
    mock_webhook_repository.mark_as_processed = AsyncMock()
    
    dto = PaymentWebhookDto(
        provider_payment_id='test_payment_id',
        event='payment.succeeded',
        amount={'value': 5000.0, 'currency': 'RUB'},
        metadata={}
    )
    
    # Act
    result = await use_case.execute(dto, 'signature', b'request_body')
    
    # Assert
    assert result is not None
    assert result['success'] is True
    payment.mark_as_succeeded.assert_called_once()
    mock_webhook_repository.is_processed.assert_called_once()
    mock_webhook_repository.mark_as_processed.assert_called_once()


@pytest.mark.asyncio
async def test_handle_payment_webhook_invalid_signature(use_case, mock_payment_adapter):
    """Тест ошибки при невалидной подписи."""
    # Arrange
    mock_payment_adapter.verify_webhook_signature = MagicMock(return_value=False)
    
    dto = PaymentWebhookDto(
        provider_payment_id='test_payment_id',
        event='payment.succeeded',
        amount={'value': 5000.0, 'currency': 'RUB'},
        metadata={}
    )
    
    # Act & Assert
    with pytest.raises(UnauthorizedError, match="Invalid webhook signature"):
        await use_case.execute(dto, 'invalid_signature', b'request_body')


@pytest.mark.asyncio
async def test_handle_payment_webhook_payment_not_found(use_case, mock_payment_repository, mock_payment_adapter, mock_webhook_repository):
    """Тест ошибки при отсутствии платежа."""
    # Arrange
    mock_payment_repository.find_by_provider_payment_id = AsyncMock(return_value=None)
    mock_webhook_repository.is_processed = AsyncMock(return_value=False)
    
    dto = PaymentWebhookDto(
        provider_payment_id='nonexistent_payment_id',
        event='payment.succeeded',
        amount={'value': 5000.0, 'currency': 'RUB'},
        metadata={}
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Payment not found"):
        await use_case.execute(dto, 'signature', b'request_body')

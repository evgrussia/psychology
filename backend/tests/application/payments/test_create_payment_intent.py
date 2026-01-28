"""
Unit тесты для CreatePaymentIntentUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.payments.use_cases.create_payment_intent import CreatePaymentIntentUseCase
from application.payments.dto import CreatePaymentIntentDto
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_service_repository():
    """Мок репозитория услуг."""
    service = MagicMock(spec=Service)
    service.id = ServiceId.generate()
    service.name = "Консультация"
    service.price = Money(5000.0, Currency.RUB)
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def mock_payment_repository():
    """Мок репозитория платежей."""
    return AsyncMock()


@pytest.fixture
def mock_payment_adapter():
    """Мок адаптера платежей."""
    adapter = AsyncMock()
    adapter.create_payment_intent = AsyncMock(return_value={
        'id': 'test_payment_id',
        'confirmation_url': 'https://example.com/pay'
    })
    return adapter


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_appointment_repository,
    mock_service_repository,
    mock_payment_repository,
    mock_payment_adapter,
    event_bus
):
    """Фикстура для Use Case."""
    return CreatePaymentIntentUseCase(
        appointment_repository=mock_appointment_repository,
        service_repository=mock_service_repository,
        payment_repository=mock_payment_repository,
        payment_adapter=mock_payment_adapter,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_create_payment_intent_success(use_case, mock_appointment_repository, mock_service_repository):
    """Тест успешного создания намерения оплаты."""
    # Arrange
    appointment_id = AppointmentId.generate()
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.service_id = mock_service_repository.find_by_id.return_value.id
    appointment.assign_payment = MagicMock()
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    mock_appointment_repository.save = AsyncMock()
    
    dto = CreatePaymentIntentDto(
        appointment_id=str(appointment_id.value),
        amount=5000.0
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.payment_id is not None
    assert result.payment_url is not None
    assert result.amount == 5000.0
    assert result.status == 'intent'


@pytest.mark.asyncio
async def test_create_payment_intent_appointment_not_found(use_case, mock_appointment_repository):
    """Тест ошибки при отсутствии записи."""
    # Arrange
    mock_appointment_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = CreatePaymentIntentDto(
        appointment_id=str(AppointmentId.generate().value),
        amount=5000.0
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Appointment not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_create_payment_intent_invalid_deposit(use_case, mock_appointment_repository, mock_service_repository):
    """Тест валидации депозита."""
    # Arrange
    appointment_id = AppointmentId.generate()
    appointment = MagicMock(spec=Appointment)
    appointment.id = appointment_id
    appointment.service_id = mock_service_repository.find_by_id.return_value.id
    
    mock_appointment_repository.find_by_id = AsyncMock(return_value=appointment)
    
    dto = CreatePaymentIntentDto(
        appointment_id=str(appointment_id.value),
        amount=5000.0,
        deposit_amount=6000.0  # Депозит больше суммы
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Deposit amount cannot be greater"):
        await use_case.execute(dto)

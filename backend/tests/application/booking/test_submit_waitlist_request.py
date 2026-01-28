"""
Unit тесты для SubmitWaitlistRequestUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.submit_waitlist_request import SubmitWaitlistRequestUseCase
from application.booking.dto import SubmitWaitlistRequestDto
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.aggregates.waitlist_request import WaitlistRequest, WaitlistRequestId
from domain.identity.aggregates.user import User, UserId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_service_repository():
    """Мок репозитория услуг."""
    service = MagicMock(spec=Service)
    service.id = ServiceId.generate()
    service.name = "Консультация"
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    return repo


@pytest.fixture
def mock_waitlist_repository():
    """Мок репозитория листа ожидания."""
    return AsyncMock()


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    return AsyncMock()


@pytest.fixture
def mock_encryption_service():
    """Мок сервиса шифрования."""
    service = MagicMock()
    service.encrypt = MagicMock(return_value='encrypted_contact')
    return service


@pytest.fixture
def mock_email_service():
    """Мок email сервиса."""
    return AsyncMock()


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_service_repository,
    mock_user_repository,
    mock_waitlist_repository,
    mock_lead_repository,
    mock_encryption_service,
    mock_email_service,
    event_bus
):
    """Фикстура для Use Case."""
    return SubmitWaitlistRequestUseCase(
        service_repository=mock_service_repository,
        user_repository=mock_user_repository,
        waitlist_repository=mock_waitlist_repository,
        lead_repository=mock_lead_repository,
        encryption_service=mock_encryption_service,
        email_service=mock_email_service,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_submit_waitlist_request_success(use_case, mock_service_repository, mock_waitlist_repository):
    """Тест успешного создания запроса в лист ожидания."""
    # Arrange
    dto = SubmitWaitlistRequestDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        user_id=str(UserId.generate().value),
        contact_info={'value': '+79991234567', 'type': 'phone'},
        consents={'communications': True}
    )
    
    mock_waitlist_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['status'] == 'pending'
    mock_waitlist_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_submit_waitlist_request_service_not_found(use_case, mock_service_repository):
    """Тест ошибки при отсутствии услуги."""
    # Arrange
    mock_service_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = SubmitWaitlistRequestDto(
        service_id=str(ServiceId.generate().value),
        contact_info={'value': '+79991234567', 'type': 'phone'},
        consents={'communications': True}
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Service not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_submit_waitlist_request_missing_consent(use_case, mock_service_repository):
    """Тест валидации согласия."""
    # Arrange
    dto = SubmitWaitlistRequestDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        contact_info={'value': '+79991234567', 'type': 'phone'},
        consents={}  # Нет согласия
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Communications consent is required"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_submit_waitlist_request_missing_contact(use_case, mock_service_repository):
    """Тест валидации контактной информации."""
    # Arrange
    dto = SubmitWaitlistRequestDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        contact_info={},  # Нет контакта
        consents={'communications': True}
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Contact info is required"):
        await use_case.execute(dto)

"""
Unit тесты для GetAvailableSlotsUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.booking.use_cases.get_available_slots import GetAvailableSlotsUseCase
from application.booking.dto import GetAvailableSlotsDto
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.entities.availability_slot import AvailabilitySlot, AvailabilitySlotId
from domain.booking.value_objects.timezone import Timezone


@pytest.fixture
def mock_service_repository():
    """Мок репозитория услуг."""
    service = MagicMock(spec=Service)
    service.id = ServiceId.generate()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def mock_appointment_repository():
    """Мок репозитория встреч."""
    return AsyncMock()


@pytest.fixture
def mock_availability_slot_repository():
    """Мок репозитория слотов."""
    slot = MagicMock(spec=AvailabilitySlot)
    slot.id = AvailabilitySlotId.generate()
    slot.start_at = datetime.now(timezone.utc) + timedelta(days=1)
    slot.end_at = slot.start_at + timedelta(hours=1)
    slot.status = 'available'
    slot.to_time_slot = MagicMock(return_value=MagicMock())
    
    repo = AsyncMock()
    repo.find_available_slots = AsyncMock(return_value=[slot])
    return repo


@pytest.fixture
def mock_slot_availability_service():
    """Мок сервиса проверки доступности."""
    service = AsyncMock()
    service.is_slot_available = AsyncMock(return_value=True)
    return service


@pytest.fixture
def use_case(
    mock_service_repository,
    mock_appointment_repository,
    mock_availability_slot_repository,
    mock_slot_availability_service
):
    """Фикстура для Use Case."""
    return GetAvailableSlotsUseCase(
        service_repository=mock_service_repository,
        appointment_repository=mock_appointment_repository,
        availability_slot_repository=mock_availability_slot_repository,
        slot_availability_service=mock_slot_availability_service
    )


@pytest.mark.asyncio
async def test_get_available_slots_success(use_case, mock_service_repository, mock_availability_slot_repository):
    """Тест успешного получения доступных слотов."""
    # Arrange
    date_from = datetime.now(timezone.utc) + timedelta(days=1)
    date_to = date_from + timedelta(days=7)
    
    dto = GetAvailableSlotsDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        timezone='UTC'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert len(result) > 0
    mock_availability_slot_repository.find_available_slots.assert_called_once()


@pytest.mark.asyncio
async def test_get_available_slots_service_not_found(use_case, mock_service_repository):
    """Тест ошибки при отсутствии услуги."""
    # Arrange
    mock_service_repository.find_by_id = AsyncMock(return_value=None)
    
    date_from = datetime.now(timezone.utc) + timedelta(days=1)
    date_to = date_from + timedelta(days=7)
    
    dto = GetAvailableSlotsDto(
        service_id=str(ServiceId.generate().value),
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        timezone='UTC'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Service not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_available_slots_invalid_dates(use_case, mock_service_repository):
    """Тест валидации дат."""
    # Arrange
    date_from = datetime.now(timezone.utc) + timedelta(days=7)
    date_to = datetime.now(timezone.utc) + timedelta(days=1)  # date_to < date_from
    
    dto = GetAvailableSlotsDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        timezone='UTC'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="dateTo must be after dateFrom"):
        await use_case.execute(dto)

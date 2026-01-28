"""
Unit тесты для CreateAvailabilitySlotUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.admin.use_cases.create_availability_slot import CreateAvailabilitySlotUseCase
from application.admin.dto import CreateAvailabilitySlotDto
from application.exceptions import ValidationError, NotFoundError
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.entities.availability_slot import AvailabilitySlot, AvailabilitySlotId


@pytest.fixture
def mock_availability_slot_repository():
    """Мок репозитория слотов."""
    return AsyncMock()


@pytest.fixture
def mock_service_repository():
    """Мок репозитория услуг."""
    service = MagicMock(spec=Service)
    service.id = ServiceId.generate()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=service)
    return repo


@pytest.fixture
def use_case(mock_availability_slot_repository, mock_service_repository):
    """Фикстура для Use Case."""
    return CreateAvailabilitySlotUseCase(
        availability_slot_repository=mock_availability_slot_repository,
        service_repository=mock_service_repository
    )


@pytest.mark.asyncio
async def test_create_availability_slot_success(use_case, mock_availability_slot_repository, mock_service_repository):
    """Тест успешного создания слота."""
    # Arrange
    start_at = datetime.now(timezone.utc) + timedelta(days=1)
    end_at = start_at + timedelta(hours=1)
    
    dto = CreateAvailabilitySlotDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        start_at=start_at.isoformat(),
        end_at=end_at.isoformat(),
        timezone='UTC'
    )
    
    mock_availability_slot_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['slots_created'] == 1
    assert len(result['slot_ids']) == 1
    mock_availability_slot_repository.save.assert_called()


@pytest.mark.asyncio
async def test_create_availability_slot_invalid_dates(use_case, mock_service_repository):
    """Тест валидации дат."""
    # Arrange
    start_at = datetime.now(timezone.utc) + timedelta(days=1)
    end_at = start_at - timedelta(hours=1)  # end_at < start_at
    
    dto = CreateAvailabilitySlotDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        start_at=start_at.isoformat(),
        end_at=end_at.isoformat(),
        timezone='UTC'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="endAt must be after startAt"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_create_availability_slot_with_recurrence(use_case, mock_availability_slot_repository, mock_service_repository):
    """Тест создания серии слотов с повторением."""
    # Arrange
    start_at = datetime.now(timezone.utc) + timedelta(days=1)
    end_at = start_at + timedelta(hours=1)
    
    dto = CreateAvailabilitySlotDto(
        service_id=str(mock_service_repository.find_by_id.return_value.id.value),
        start_at=start_at.isoformat(),
        end_at=end_at.isoformat(),
        timezone='UTC',
        recurrence={
            'frequency': 'daily',
            'interval': 1,
            'endDate': (start_at + timedelta(days=7)).isoformat()
        }
    )
    
    mock_availability_slot_repository.save = AsyncMock()
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['slots_created'] > 1  # Должно быть несколько слотов
    assert len(result['slot_ids']) == result['slots_created']

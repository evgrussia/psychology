"""
Unit тесты для ExportDiaryToPdfUseCase.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock

from application.client_cabinet.use_cases.export_diary_to_pdf import ExportDiaryToPdfUseCase
from application.client_cabinet.dto import ExportDiaryToPdfDto
from application.exceptions import NotFoundError, ValidationError
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.identity.aggregates.user import User, UserId
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_diary_repository():
    """Мок репозитория дневников."""
    entry = MagicMock(spec=DiaryEntry)
    entry.id = DiaryEntryId.generate()
    entry.diary_type = MagicMock()
    entry.diary_type.value = 'mood'
    entry.content = 'encrypted_content'
    entry.created_at = datetime.now(timezone.utc) - timedelta(days=5)
    
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=[entry])
    return repo


@pytest.fixture
def mock_data_export_repository():
    """Мок репозитория экспортов."""
    repo = AsyncMock()
    repo.create_export_request = AsyncMock(return_value='export_id_123')
    return repo


@pytest.fixture
def mock_user_repository():
    """Мок репозитория пользователей."""
    user = MagicMock(spec=User)
    user.id = UserId.generate()
    user.name = "Test User"
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=user)
    return repo


@pytest.fixture
def mock_encryption_service():
    """Мок сервиса шифрования."""
    service = MagicMock()
    service.decrypt = MagicMock(return_value='{"mood": "calm"}')
    return service


@pytest.fixture
def mock_pdf_generator_service():
    """Мок сервиса генерации PDF."""
    from io import BytesIO
    service = AsyncMock()
    service.generate_diary_pdf = AsyncMock(return_value=BytesIO(b'PDF content'))
    return service


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(
    mock_diary_repository,
    mock_data_export_repository,
    mock_user_repository,
    mock_encryption_service,
    mock_pdf_generator_service,
    event_bus
):
    """Фикстура для Use Case."""
    return ExportDiaryToPdfUseCase(
        diary_entry_repository=mock_diary_repository,
        data_export_repository=mock_data_export_repository,
        user_repository=mock_user_repository,
        encryption_service=mock_encryption_service,
        pdf_generator_service=mock_pdf_generator_service,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_export_diary_to_pdf_success(use_case, mock_user_repository, mock_data_export_repository):
    """Тест успешного экспорта дневника в PDF."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    date_from = datetime.now(timezone.utc) - timedelta(days=7)
    date_to = datetime.now(timezone.utc)
    
    dto = ExportDiaryToPdfDto(
        user_id=str(user_id.value),
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        format='pdf'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.export_id is not None
    assert result.status == 'processing'
    mock_data_export_repository.create_export_request.assert_called_once()


@pytest.mark.asyncio
async def test_export_diary_to_pdf_user_not_found(use_case, mock_user_repository):
    """Тест ошибки при отсутствии пользователя."""
    # Arrange
    mock_user_repository.find_by_id = AsyncMock(return_value=None)
    
    date_from = datetime.now(timezone.utc) - timedelta(days=7)
    date_to = datetime.now(timezone.utc)
    
    dto = ExportDiaryToPdfDto(
        user_id=str(UserId.generate().value),
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        format='pdf'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="User not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_export_diary_to_pdf_invalid_dates(use_case, mock_user_repository):
    """Тест валидации дат."""
    # Arrange
    user_id = mock_user_repository.find_by_id.return_value.id
    date_from = datetime.now(timezone.utc)
    date_to = datetime.now(timezone.utc) - timedelta(days=7)  # date_to < date_from
    
    dto = ExportDiaryToPdfDto(
        user_id=str(user_id.value),
        date_from=date_from.isoformat(),
        date_to=date_to.isoformat(),
        format='pdf'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="dateTo must be after dateFrom"):
        await use_case.execute(dto)

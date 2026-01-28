"""
Unit тесты для GetLeadsListUseCase.
"""
import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from application.admin.use_cases.get_leads_list import GetLeadsListUseCase
from application.admin.dto import GetLeadsListDto
from application.exceptions import ValidationError
from domain.analytics.aggregates.lead import Lead, LeadId
from domain.analytics.value_objects.lead_status import LeadStatus
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.lead_identity import LeadIdentity


@pytest.fixture
def mock_lead_repository():
    """Мок репозитория лидов."""
    lead = MagicMock(spec=Lead)
    lead.id = LeadId.generate()
    lead.status = LeadStatus.NEW
    lead.source = LeadSource('web')
    lead.topic_code = None
    lead.timeline = []
    lead.created_at = datetime.now(timezone.utc)
    
    repo = AsyncMock()
    repo.find_by_status = AsyncMock(return_value=[lead])
    return repo


@pytest.fixture
def use_case(mock_lead_repository):
    """Фикстура для Use Case."""
    return GetLeadsListUseCase(lead_repository=mock_lead_repository)


@pytest.mark.asyncio
async def test_get_leads_list_success(use_case, mock_lead_repository):
    """Тест успешного получения списка лидов."""
    # Arrange
    dto = GetLeadsListDto(
        page=1,
        per_page=20,
        status=None,
        source=None,
        date_from=None,
        date_to=None
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result.data is not None
    assert result.pagination is not None
    assert result.pagination['page'] == 1
    assert result.pagination['per_page'] == 20


@pytest.mark.asyncio
async def test_get_leads_list_with_filters(use_case, mock_lead_repository):
    """Тест получения лидов с фильтрами."""
    # Arrange
    dto = GetLeadsListDto(
        page=1,
        per_page=20,
        status='new',
        source='web',
        date_from=None,
        date_to=None
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    mock_lead_repository.find_by_status.assert_called()


@pytest.mark.asyncio
async def test_get_leads_list_invalid_page(use_case):
    """Тест валидации номера страницы."""
    # Arrange
    dto = GetLeadsListDto(
        page=0,  # Невалидный номер страницы
        per_page=20
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Page must be >= 1"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_get_leads_list_invalid_per_page(use_case):
    """Тест валидации количества на странице."""
    # Arrange
    dto = GetLeadsListDto(
        page=1,
        per_page=0  # Невалидное количество
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Per page must be between"):
        await use_case.execute(dto)

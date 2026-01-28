"""
Unit тесты для AnswerUGCQuestionUseCase.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from application.admin.use_cases.answer_ugc_question import AnswerUGCQuestionUseCase
from application.admin.dto import AnswerUGCQuestionDto
from application.exceptions import NotFoundError, ValidationError
from domain.identity.aggregates.user import UserId
from domain.ugc_moderation.aggregates.moderation_item import ModerationItem, ModerationItemId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.fixture
def mock_moderation_repository():
    """Мок репозитория модерации."""
    item = MagicMock(spec=ModerationItem)
    item.id = ModerationItemId.generate()
    item.status = MagicMock()
    item.status.value = 'approved'
    item.add_answer = MagicMock()
    item.get_domain_events = MagicMock(return_value=[])
    item.clear_domain_events = MagicMock()
    
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=item)
    repo.save = AsyncMock()
    return repo


@pytest.fixture
def mock_encryption_service():
    """Мок сервиса шифрования."""
    service = MagicMock()
    service.encrypt = MagicMock(return_value='encrypted_answer')
    return service


@pytest.fixture
def event_bus():
    """Фикстура для Event Bus."""
    return InMemoryEventBus()


@pytest.fixture
def use_case(mock_moderation_repository, mock_encryption_service, event_bus):
    """Фикстура для Use Case."""
    return AnswerUGCQuestionUseCase(
        moderation_repository=mock_moderation_repository,
        encryption_service=mock_encryption_service,
        event_bus=event_bus
    )


@pytest.mark.asyncio
async def test_answer_ugc_question_success(use_case, mock_moderation_repository):
    """Тест успешного ответа на вопрос."""
    # Arrange
    item_id = mock_moderation_repository.find_by_id.return_value.id
    
    dto = AnswerUGCQuestionDto(
        item_id=str(item_id.value),
        owner_id=str(UserId.generate().value),
        answer_text='Это ответ на вопрос'
    )
    
    # Act
    result = await use_case.execute(dto)
    
    # Assert
    assert result is not None
    assert result['status'] == 'answered'
    assert result['answer_id'] is not None
    mock_moderation_repository.find_by_id.return_value.add_answer.assert_called_once()
    mock_moderation_repository.save.assert_called_once()


@pytest.mark.asyncio
async def test_answer_ugc_question_not_found(use_case, mock_moderation_repository):
    """Тест ошибки при отсутствии вопроса."""
    # Arrange
    mock_moderation_repository.find_by_id = AsyncMock(return_value=None)
    
    dto = AnswerUGCQuestionDto(
        item_id=str(ModerationItemId.generate().value),
        owner_id=str(UserId.generate().value),
        answer_text='Ответ'
    )
    
    # Act & Assert
    with pytest.raises(NotFoundError, match="Moderation item not found"):
        await use_case.execute(dto)


@pytest.mark.asyncio
async def test_answer_ugc_question_not_approved(use_case, mock_moderation_repository):
    """Тест ошибки при попытке ответить на неодобренный вопрос."""
    # Arrange
    item = mock_moderation_repository.find_by_id.return_value
    item.status.value = 'pending'  # Не одобрен
    
    dto = AnswerUGCQuestionDto(
        item_id=str(item.id.value),
        owner_id=str(UserId.generate().value),
        answer_text='Ответ'
    )
    
    # Act & Assert
    with pytest.raises(ValidationError, match="Can only answer approved questions"):
        await use_case.execute(dto)

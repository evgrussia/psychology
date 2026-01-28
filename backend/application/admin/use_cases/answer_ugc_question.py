"""
Use Case: ответ на анонимный вопрос.
"""
from application.exceptions import NotFoundError, ValidationError
from domain.ugc_moderation.repositories import IModerationItemRepository
from domain.ugc_moderation.aggregates.moderation_item import ModerationItemId
from domain.ugc_moderation.entities.answer import Answer, AnswerId
from domain.identity.aggregates.user import UserId
from application.interfaces.encryption import IEncryptionService
from application.interfaces.event_bus import IEventBus
from datetime import datetime, timezone

from application.admin.dto import AnswerUGCQuestionDto


class AnswerUGCQuestionUseCase:
    """Use Case для ответа на анонимный вопрос."""
    
    def __init__(
        self,
        moderation_repository: IModerationItemRepository,
        encryption_service: IEncryptionService,
        event_bus: IEventBus
    ):
        self._moderation_repository = moderation_repository
        self._encryption_service = encryption_service
        self._event_bus = event_bus
    
    async def execute(self, dto: AnswerUGCQuestionDto) -> dict:
        """
        Отвечает на анонимный вопрос.
        
        Returns:
            dict с результатом операции.
        
        Raises:
            NotFoundError: Если вопрос не найден
            ValidationError: Если вопрос не одобрен
        """
        # 1. Получение агрегата
        item_id = ModerationItemId(dto.item_id)
        item = await self._moderation_repository.find_by_id(item_id)
        if not item:
            raise NotFoundError("Moderation item not found")
        
        # 2. Проверка статуса
        if item.status.value != 'approved':
            raise ValidationError("Can only answer approved questions")
        
        # 3. Шифрование ответа
        encrypted_answer = self._encryption_service.encrypt(dto.answer_text)
        
        # 4. Создание Answer
        owner_id = UserId(dto.owner_id)
        answer = Answer(
            id=AnswerId.generate(),
            author_id=owner_id,  # Используем author_id вместо owner_id
            content=encrypted_answer,
            created_at=datetime.now(timezone.utc)
        )
        
        # 5. Добавление ответа
        item.add_answer(answer)
        
        # 6. Сохранение
        await self._moderation_repository.save(item)
        
        # 7. Публикация событий
        events = item.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        item.clear_domain_events()
        
        # 8. Возврат результата
        return {
            'item_id': dto.item_id,
            'answer_id': str(answer.id.value),
            'status': 'answered'
        }

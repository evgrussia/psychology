"""
Use Case: модерация UGC (анонимный вопрос/отзыв).
"""
from application.exceptions import NotFoundError, ValidationError
from domain.ugc_moderation.repositories import IModerationItemRepository
from domain.ugc_moderation.aggregates.moderation_item import ModerationItemId
from domain.ugc_moderation.value_objects.moderation_decision import ModerationDecision
from domain.identity.aggregates.user import UserId
from application.interfaces.event_bus import IEventBus

from application.admin.dto import ModerateUGCItemDto


class ModerateUGCItemUseCase:
    """Use Case для модерации UGC."""
    
    def __init__(
        self,
        moderation_repository: IModerationItemRepository,
        event_bus: IEventBus
    ):
        self._moderation_repository = moderation_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: ModerateUGCItemDto) -> dict:
        """
        Модерирует UGC элемент.
        
        Returns:
            dict с результатом модерации.
        
        Raises:
            NotFoundError: Если элемент не найден
            ValidationError: Если решение невалидно
        """
        # 1. Получение агрегата
        item_id = ModerationItemId(dto.item_id)
        item = await self._moderation_repository.find_by_id(item_id)
        if not item:
            raise NotFoundError("Moderation item not found")
        
        # 2. Валидация решения
        if dto.decision not in ('approve', 'reject'):
            raise ValidationError(f"Invalid decision: {dto.decision}")
        
        # 3. Модерация
        moderator_id = UserId(dto.moderator_id)
        decision = ModerationDecision(dto.decision)
        
        item.moderate(moderator_id, decision)
        
        # 4. Сохранение
        await self._moderation_repository.save(item)
        
        # 5. Публикация событий
        events = item.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        item.clear_domain_events()
        
        # 6. Возврат результата
        return {
            'item_id': dto.item_id,
            'decision': dto.decision,
            'status': item.status.value
        }

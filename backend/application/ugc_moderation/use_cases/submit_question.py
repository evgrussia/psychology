"""
Use Case: отправка анонимного вопроса (UGC).
"""
from uuid import uuid4
from datetime import datetime, timezone
from application.exceptions import ValidationError
from domain.ugc_moderation.aggregates.moderation_item import (
    ModerationItem,
    ModerationItemId,
)
from domain.ugc_moderation.value_objects.ugc_content_type import UGCContentType
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
from domain.identity.aggregates.user import UserId
from domain.ugc_moderation.repositories import IModerationItemRepository
from application.interfaces.encryption import IEncryptionService
from application.interfaces.event_bus import IEventBus
from domain.ugc_moderation.domain_events import QuestionSubmittedEvent

from application.ugc_moderation.dto import SubmitQuestionDto, QuestionResponseDto


class SubmitQuestionUseCase:
    """Use Case для отправки анонимного вопроса."""
    
    def __init__(
        self,
        moderation_repository: IModerationItemRepository,
        encryption_service: IEncryptionService,
        event_bus: IEventBus
    ):
        self._moderation_repository = moderation_repository
        self._encryption_service = encryption_service
        self._event_bus = event_bus
    
    async def execute(self, dto: SubmitQuestionDto) -> QuestionResponseDto:
        """
        Отправляет анонимный вопрос.
        
        Returns:
            QuestionResponseDto с данными созданного вопроса.
        
        Raises:
            ValidationError: Если данные невалидны
        """
        # 1. Валидация контента
        if not dto.content or len(dto.content.strip()) < 10:
            raise ValidationError("Question content must be at least 10 characters long")
        
        if len(dto.content) > 5000:
            raise ValidationError("Question content must not exceed 5000 characters")
        
        # 2. Проверка кризисных триггеров
        trigger_flags = self._detect_crisis_indicators(dto.content)
        
        # 3. Шифрование контента (P2 данные)
        encrypted_content = self._encryption_service.encrypt(dto.content)
        
        # 4. Создание агрегата
        author_id = UserId(dto.user_id) if dto.user_id else None
        
        item = ModerationItem(
            id=ModerationItemId(uuid4()),
            content_type=UGCContentType('question'),
            content=encrypted_content,
            author_id=author_id,
            status=ModerationStatus.PENDING if not trigger_flags else ModerationStatus.FLAGGED,
            trigger_flags=trigger_flags,
            actions=[],
            answer=None,
            created_at=datetime.now(timezone.utc)
        )
        
        # Добавляем доменное событие
        item.add_domain_event(
            QuestionSubmittedEvent(item_id=item.id)
        )
        
        # 5. Сохранение
        await self._moderation_repository.save(item)
        
        # 6. Публикация событий
        events = item.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        item.clear_domain_events()
        
        # 7. Возврат DTO
        return QuestionResponseDto(
            id=str(item.id.value),
            content=dto.content,  # Возвращаем незашифрованный для подтверждения
            status=item.status.value,
            created_at=item.created_at.isoformat()
        )
    
    def _detect_crisis_indicators(self, content: str) -> list:
        """Определяет кризисные триггеры в контенте."""
        from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
        
        crisis_keywords = [
            'суицид', 'самоубийство', 'убить себя', 'покончить',
            'не хочу жить', 'лучше умереть', 'самоповреждение',
            'резать себя', 'повредить себя'
        ]
        
        content_lower = content.lower()
        flags = []
        
        for keyword in crisis_keywords:
            if keyword in content_lower:
                flags.append(TriggerFlag('crisis'))
                break  # Достаточно одного триггера
        
        return flags

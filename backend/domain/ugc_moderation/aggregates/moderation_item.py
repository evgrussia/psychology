"""
ModerationItem Aggregate Root.
"""
from datetime import datetime, timezone
from typing import List, Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId
from domain.ugc_moderation.value_objects.moderation_status import ModerationStatus
from domain.ugc_moderation.value_objects.ugc_content_type import UGCContentType
from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
from domain.ugc_moderation.entities.moderation_action import ModerationAction
from domain.ugc_moderation.entities.answer import Answer
from domain.ugc_moderation.domain_events import (
    QuestionSubmittedEvent,
    UGCFlaggedEvent,
    UGCModeratedEvent,
    UGCAnsweredEvent
)


class ModerationItemId(EntityId):
    """ID элемента модерации."""
    pass


class ModerationItem(AggregateRoot):
    """Aggregate Root для элемента модерации.
    
    Бизнес-правила:
    - Контент UGC хранится зашифрованным (P2 данные)
    - Кризисные триггеры автоматически флагят контент
    - Модерация требует роли owner/assistant
    - Ответ на вопрос возможен только после одобрения
    """
    
    def __init__(
        self,
        id: ModerationItemId,
        content_type: UGCContentType,
        content: str,  # Зашифрованное содержимое
        author_id: Optional[UserId],
        status: ModerationStatus,
        trigger_flags: List[TriggerFlag],
        actions: List[ModerationAction],
        answer: Optional[Answer],
        created_at: datetime
    ):
        super().__init__()
        self._id = id
        self._content_type = content_type
        self._content = content
        self._author_id = author_id
        self._status = status
        self._trigger_flags = trigger_flags
        self._actions = actions
        self._answer = answer
        self._created_at = created_at
    
    def flag(self, flag: TriggerFlag) -> None:
        """Флагит контент."""
        if flag not in self._trigger_flags:
            self._trigger_flags.append(flag)
            self._status = ModerationStatus.FLAGGED
        
        self.add_domain_event(
            UGCFlaggedEvent(
                item_id=self._id,
                flag=flag
            )
        )
    
    def moderate(
        self,
        moderator_id: UserId,
        decision: "ModerationDecision"
    ) -> None:
        """Модерирует контент."""
        from domain.ugc_moderation.entities.moderation_action import ModerationActionId
        
        action = ModerationAction(
            id=ModerationActionId.generate(),
            moderator_id=moderator_id,
            decision=decision,
            created_at=datetime.now(timezone.utc)
        )
        self._actions.append(action)
        
        if decision.value == 'approve':
            self._status = ModerationStatus.APPROVED
        elif decision.value == 'reject':
            self._status = ModerationStatus.REJECTED
        
        self.add_domain_event(
            UGCModeratedEvent(
                item_id=self._id,
                decision=decision
            )
        )
    
    def add_answer(self, answer: Answer) -> None:
        """Добавляет ответ на вопрос."""
        if self._status.value != 'approved':
            raise ValueError("Can only add answer to approved content")
        
        self._answer = answer
        
        self.add_domain_event(
            UGCAnsweredEvent(
                item_id=self._id,
                answer_id=answer.id
            )
        )
    
    @property
    def id(self) -> ModerationItemId:
        return self._id
    
    @property
    def content_type(self) -> UGCContentType:
        return self._content_type
    
    @property
    def status(self) -> ModerationStatus:
        return self._status
    
    @property
    def trigger_flags(self) -> List[TriggerFlag]:
        return list(self._trigger_flags)
    
    @property
    def actions(self) -> List[ModerationAction]:
        return list(self._actions)
    
    @property
    def created_at(self) -> datetime:
        return self._created_at

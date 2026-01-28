"""
UGC Moderation Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from domain.shared.domain_event import DomainEvent
from domain.ugc_moderation.value_objects.trigger_flag import TriggerFlag
from domain.ugc_moderation.value_objects.moderation_decision import ModerationDecision


@dataclass(frozen=True, kw_only=True)
class QuestionSubmittedEvent(DomainEvent):
    """Событие отправки вопроса."""
    item_id: "ModerationItemId"
    
    @property
    def aggregate_id(self) -> str:
        return self.item_id.value
    
    @property
    def event_name(self) -> str:
        return "QuestionSubmitted"


@dataclass(frozen=True, kw_only=True)
class UGCFlaggedEvent(DomainEvent):
    """Событие флагинга UGC контента."""
    item_id: "ModerationItemId"
    flag: TriggerFlag
    
    @property
    def aggregate_id(self) -> str:
        return self.item_id.value
    
    @property
    def event_name(self) -> str:
        return "UGCFlagged"


@dataclass(frozen=True, kw_only=True)
class UGCModeratedEvent(DomainEvent):
    """Событие модерации UGC контента."""
    item_id: "ModerationItemId"
    decision: ModerationDecision
    
    @property
    def aggregate_id(self) -> str:
        return self.item_id.value
    
    @property
    def event_name(self) -> str:
        return "UGCModerated"


@dataclass(frozen=True, kw_only=True)
class UGCAnsweredEvent(DomainEvent):
    """Событие ответа на UGC контент."""
    item_id: "ModerationItemId"
    answer_id: "AnswerId"
    
    @property
    def aggregate_id(self) -> str:
        return self.item_id.value
    
    @property
    def event_name(self) -> str:
        return "UGCAnswered"

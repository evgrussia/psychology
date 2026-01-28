"""
ModerationAction Entity.
"""
from datetime import datetime
from domain.shared.entity_id import EntityId
from domain.identity.aggregates.user import UserId
from domain.ugc_moderation.value_objects.moderation_decision import ModerationDecision


class ModerationActionId(EntityId):
    """ID действия модерации."""
    pass


class ModerationAction:
    """Entity: Действие модерации."""
    
    def __init__(
        self,
        id: ModerationActionId,
        moderator_id: UserId,
        decision: ModerationDecision,
        created_at: datetime
    ):
        self._id = id
        self._moderator_id = moderator_id
        self._decision = decision
        self._created_at = created_at
    
    @property
    def id(self) -> ModerationActionId:
        return self._id
    
    @property
    def moderator_id(self) -> UserId:
        return self._moderator_id
    
    @property
    def decision(self) -> ModerationDecision:
        return self._decision

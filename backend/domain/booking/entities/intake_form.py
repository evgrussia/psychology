"""
IntakeForm Entity.
"""
from datetime import datetime, timezone
from typing import Dict, Any
from domain.shared.entity_id import EntityId


class IntakeFormId(EntityId):
    """ID анкеты."""
    pass


class IntakeForm:
    """Entity: Анкета для встречи."""
    
    def __init__(
        self,
        id: IntakeFormId,
        answers: Dict[str, Any],
        submitted_at: datetime
    ):
        self._id = id
        self._answers = answers
        self._submitted_at = submitted_at
    
    @classmethod
    def create(cls, answers: Dict[str, Any]) -> "IntakeForm":
        """Factory method для создания анкеты."""
        return cls(
            id=IntakeFormId.generate(),
            answers=answers,
            submitted_at=datetime.now(timezone.utc)
        )
    
    @property
    def id(self) -> IntakeFormId:
        return self._id
    
    @property
    def answers(self) -> Dict[str, Any]:
        return self._answers.copy()
    
    @property
    def submitted_at(self) -> datetime:
        return self._submitted_at

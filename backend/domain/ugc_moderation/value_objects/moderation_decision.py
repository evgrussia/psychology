"""
ModerationDecision Value Object.
"""
from domain.shared.value_object import ValueObject


class ModerationDecision(ValueObject):
    """Value Object для решения модерации."""
    
    def __init__(self, value: str):
        valid_decisions = ['approve', 'reject', 'flag']
        if value not in valid_decisions:
            raise ValueError(f"Invalid moderation decision: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value

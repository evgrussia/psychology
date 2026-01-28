"""
ModerationStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class ModerationStatus(ValueObject):
    """Value Object для статуса модерации."""
    
    def __init__(self, value: str):
        valid_statuses = ['pending', 'approved', 'rejected', 'flagged']
        if value not in valid_statuses:
            raise ValueError(f"Invalid moderation status: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    PENDING = None
    APPROVED = None
    REJECTED = None
    FLAGGED = None


ModerationStatus.PENDING = ModerationStatus('pending')
ModerationStatus.APPROVED = ModerationStatus('approved')
ModerationStatus.REJECTED = ModerationStatus('rejected')
ModerationStatus.FLAGGED = ModerationStatus('flagged')

"""
TimelineEvent Value Object.
"""
from datetime import datetime
from typing import Optional, Dict, Any
from domain.shared.value_object import ValueObject


class TimelineEvent(ValueObject):
    """Value Object для события в timeline лида (только P0 данные)."""
    
    def __init__(
        self,
        event_type: str,
        occurred_at: datetime,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self._event_type = event_type
        self._occurred_at = occurred_at
        self._metadata = metadata or {}
    
    @property
    def event_type(self) -> str:
        return self._event_type
    
    @property
    def occurred_at(self) -> datetime:
        return self._occurred_at

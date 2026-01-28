"""
OutcomeRecord Entity.
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from domain.shared.entity_id import EntityId


class OutcomeRecordId(EntityId):
    """ID записи результата."""
    pass


class AppointmentOutcome:
    """Value Object для результата встречи."""
    
    def __init__(
        self,
        is_no_show: bool,
        notes: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        self._is_no_show = is_no_show
        self._notes = notes
        self._additional_data = additional_data or {}
    
    def is_no_show(self) -> bool:
        return self._is_no_show
    
    @property
    def notes(self) -> Optional[str]:
        return self._notes
    
    @property
    def additional_data(self) -> Dict[str, Any]:
        return self._additional_data.copy()


class OutcomeRecord:
    """Entity: Запись результата встречи."""
    
    def __init__(
        self,
        id: OutcomeRecordId,
        outcome: AppointmentOutcome,
        recorded_at: datetime
    ):
        self._id = id
        self._outcome = outcome
        self._recorded_at = recorded_at
    
    @classmethod
    def create(cls, outcome: AppointmentOutcome) -> "OutcomeRecord":
        """Factory method для создания записи результата."""
        return cls(
            id=OutcomeRecordId.generate(),
            outcome=outcome,
            recorded_at=datetime.now(timezone.utc)
        )
    
    @property
    def id(self) -> OutcomeRecordId:
        return self._id
    
    @property
    def outcome(self) -> AppointmentOutcome:
        return self._outcome
    
    @property
    def recorded_at(self) -> datetime:
        return self._recorded_at

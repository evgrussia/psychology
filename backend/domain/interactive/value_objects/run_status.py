"""
RunStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class RunStatus(ValueObject):
    """Value Object для статуса прохождения интерактива."""
    
    def __init__(self, value: str):
        valid_statuses = ['started', 'completed', 'abandoned']
        if value not in valid_statuses:
            raise ValueError(f"Invalid run status: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    STARTED = None
    COMPLETED = None
    ABANDONED = None


RunStatus.STARTED = RunStatus('started')
RunStatus.COMPLETED = RunStatus('completed')
RunStatus.ABANDONED = RunStatus('abandoned')

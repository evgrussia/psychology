"""
AppointmentFormat Value Object.
"""
from domain.shared.value_object import ValueObject


class AppointmentFormat(ValueObject):
    """Value Object для формата встречи."""
    
    def __init__(self, value: str):
        valid_formats = ['online', 'offline', 'hybrid']
        if value not in valid_formats:
            raise ValueError(f"Invalid appointment format: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные форматы
    ONLINE = None
    OFFLINE = None
    HYBRID = None


AppointmentFormat.ONLINE = AppointmentFormat('online')
AppointmentFormat.OFFLINE = AppointmentFormat('offline')
AppointmentFormat.HYBRID = AppointmentFormat('hybrid')

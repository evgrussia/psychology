"""
UserStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class UserStatus(ValueObject):
    """Value Object для статуса пользователя."""
    
    def __init__(self, value: str):
        if value not in ['active', 'blocked', 'deleted']:
            raise ValueError(f"Invalid user status: {value}")
        self._value = value
    
    def is_active(self) -> bool:
        return self._value == 'active'
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    ACTIVE = None
    BLOCKED = None
    DELETED = None


UserStatus.ACTIVE = UserStatus('active')
UserStatus.BLOCKED = UserStatus('blocked')
UserStatus.DELETED = UserStatus('deleted')

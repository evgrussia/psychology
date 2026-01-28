"""
DeepLinkFlow Value Object.
"""
from domain.shared.value_object import ValueObject


class DeepLinkFlow(ValueObject):
    """Value Object для типа deep link flow."""
    
    def __init__(self, value: str):
        valid_flows = ['booking', 'quiz', 'content', 'profile']
        if value not in valid_flows:
            raise ValueError(f"Invalid deep link flow: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value

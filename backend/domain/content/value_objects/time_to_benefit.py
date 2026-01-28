"""
TimeToBenefit Value Object.
"""
from domain.shared.value_object import ValueObject


class TimeToBenefit(ValueObject):
    """Value Object для времени до получения пользы."""
    
    def __init__(self, value: str):
        valid_values = ['immediate', 'short_term', 'medium_term', 'long_term']
        if value not in valid_values:
            raise ValueError(f"Invalid time to benefit: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    @property
    def minutes(self) -> int:
        mapping = {
            'immediate': 5,
            'short_term': 15,
            'medium_term': 45,
            'long_term': 120
        }
        return mapping[self._value]

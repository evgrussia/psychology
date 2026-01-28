"""
LeadSource Value Object.
"""
from domain.shared.value_object import ValueObject


class LeadSource(ValueObject):
    """Value Object для источника лида."""
    
    def __init__(self, value: str):
        valid_sources = ['web', 'telegram', 'referral', 'organic', 'paid']
        if value not in valid_sources:
            raise ValueError(f"Invalid lead source: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value

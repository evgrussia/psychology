"""
Currency Value Object.
"""
from domain.shared.value_object import ValueObject


class Currency(ValueObject):
    """Value Object для валюты."""
    
    def __init__(self, code: str):
        if not code or not isinstance(code, str):
            raise ValueError(f"Invalid currency code: {code}")
        self._code = code.upper()
    
    def equals(self, other: "Currency") -> bool:
        """Проверяет равенство валют."""
        return self._code == other._code
    
    @property
    def code(self) -> str:
        return self._code
    
    def __str__(self) -> str:
        return self._code
    
    # Предопределенные валюты
    RUB = None
    USD = None
    EUR = None


Currency.RUB = Currency('RUB')
Currency.USD = Currency('USD')
Currency.EUR = Currency('EUR')

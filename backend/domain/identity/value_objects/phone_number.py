"""
PhoneNumber Value Object.
"""
import re
from domain.shared.value_object import ValueObject


class PhoneNumber(ValueObject):
    """Value Object для номера телефона.
    
    Бизнес-правила:
    - Телефон нормализуется (только цифры)
    - Длина: 10-15 цифр
    - Форматирование для отображения
    """
    
    def __init__(self, value: str):
        normalized = self._normalize(value)
        
        if not self._is_valid(normalized):
            raise ValueError(f"Invalid phone number: {value}")
        
        self._value = normalized
    
    @classmethod
    def create(cls, phone: str) -> "PhoneNumber":
        """Создает PhoneNumber Value Object."""
        return cls(phone)
    
    @staticmethod
    def _normalize(phone: str) -> str:
        """Нормализует телефон (только цифры)."""
        return re.sub(r'\D', '', phone)
    
    @staticmethod
    def _is_valid(normalized: str) -> bool:
        """Проверяет валидность телефона."""
        return 10 <= len(normalized) <= 15
    
    def format(self) -> str:
        """Форматирует телефон для отображения.
        
        Пример: +7 (XXX) XXX-XX-XX для российских номеров
        """
        if len(self._value) == 11 and self._value.startswith('7'):
            return f"+7 ({self._value[1:4]}) {self._value[4:7]}-{self._value[7:9]}-{self._value[9:]}"
        return self._value
    
    @property
    def value(self) -> str:
        return self._value
    
    def __str__(self) -> str:
        return self._value

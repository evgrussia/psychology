"""
Money Value Object.
"""
from decimal import Decimal
from typing import Union
from domain.shared.value_object import ValueObject
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.currency import Currency


class Money(ValueObject):
    """Value Object для денежной суммы.
    
    Бизнес-правила:
    - Сумма не может быть отрицательной
    - Операции возможны только с одинаковой валютой
    """
    
    def __init__(self, amount: Union[float, Decimal, int, str], currency: Currency):
        # Приводим к Decimal для точности финансовых расчетов
        try:
            decimal_amount = Decimal(str(amount))
        except (ValueError, TypeError):
            raise DomainError(f"Invalid amount format: {amount}")
            
        if decimal_amount < 0:
            raise DomainError("Amount cannot be negative")
        
        self._amount = decimal_amount
        self._currency = currency
    
    def add(self, other: "Money") -> "Money":
        """Складывает две суммы."""
        self._ensure_same_currency(other)
        return Money(self._amount + other._amount, self._currency)
    
    def subtract(self, other: "Money") -> "Money":
        """Вычитает сумму."""
        self._ensure_same_currency(other)
        if self._amount < other._amount:
            raise DomainError("Result cannot be negative")
        return Money(self._amount - other._amount, self._currency)
    
    def multiply(self, factor: Union[float, Decimal, int]) -> "Money":
        """Умножает сумму на коэффициент."""
        try:
            decimal_factor = Decimal(str(factor))
        except (ValueError, TypeError):
            raise DomainError(f"Invalid factor format: {factor}")
            
        if decimal_factor < 0:
            raise DomainError("Factor cannot be negative")
        return Money(self._amount * decimal_factor, self._currency)
    
    def equals(self, other: "Money") -> bool:
        """Проверяет равенство сумм."""
        return (self._amount == other._amount and 
                self._currency.equals(other._currency))
    
    def _ensure_same_currency(self, other: "Money") -> None:
        """Проверяет, что валюты совпадают."""
        if not self._currency.equals(other._currency):
            raise DomainError("Cannot operate on different currencies")
    
    @property
    def amount(self) -> Decimal:
        return self._amount
    
    @property
    def currency(self) -> Currency:
        return self._currency

"""
Tests for Money Value Object.
"""
import pytest
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.shared.exceptions import DomainError


class TestMoney:
    """Tests for Money value object."""
    
    def test_create_valid_money(self):
        """Test creating valid money."""
        currency = Currency.RUB
        money = Money(100.0, currency)
        
        assert money.amount == 100.0
        assert money.currency == currency
    
    def test_create_invalid_money_negative(self):
        """Test creating money with negative amount."""
        currency = Currency.RUB
        
        with pytest.raises(DomainError, match="Amount cannot be negative"):
            Money(-100.0, currency)
    
    def test_add_money(self):
        """Test adding money."""
        money1 = Money(100.0, Currency.RUB)
        money2 = Money(50.0, Currency.RUB)
        
        result = money1.add(money2)
        
        assert result.amount == 150.0
        assert result.currency == Currency.RUB
    
    def test_add_different_currencies(self):
        """Test adding money with different currencies."""
        money1 = Money(100.0, Currency.RUB)
        money2 = Money(50.0, Currency.USD)
        
        with pytest.raises(DomainError, match="Cannot operate on different currencies"):
            money1.add(money2)
    
    def test_subtract_money(self):
        """Test subtracting money."""
        money1 = Money(100.0, Currency.RUB)
        money2 = Money(30.0, Currency.RUB)
        
        result = money1.subtract(money2)
        
        assert result.amount == 70.0
        assert result.currency == Currency.RUB
    
    def test_subtract_money_negative_result(self):
        """Test subtracting money that would result in negative."""
        money1 = Money(50.0, Currency.RUB)
        money2 = Money(100.0, Currency.RUB)
        
        with pytest.raises(DomainError, match="Result cannot be negative"):
            money1.subtract(money2)
    
    def test_multiply_money(self):
        """Test multiplying money."""
        money = Money(100.0, Currency.RUB)
        
        result = money.multiply(1.5)
        
        assert result.amount == 150.0
        assert result.currency == Currency.RUB
    
    def test_multiply_money_negative_factor(self):
        """Test multiplying money with negative factor."""
        money = Money(100.0, Currency.RUB)
        
        with pytest.raises(DomainError, match="Factor cannot be negative"):
            money.multiply(-1.0)
    
    def test_equals(self):
        """Test equals method."""
        money1 = Money(100.0, Currency.RUB)
        money2 = Money(100.0, Currency.RUB)
        money3 = Money(50.0, Currency.RUB)
        money4 = Money(100.0, Currency.USD)
        
        assert money1.equals(money2) is True
        assert money1.equals(money3) is False
        assert money1.equals(money4) is False

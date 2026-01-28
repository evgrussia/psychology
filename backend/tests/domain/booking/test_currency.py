"""
Tests for Currency Value Object.
"""
import pytest
from domain.booking.value_objects.currency import Currency


class TestCurrency:
    """Tests for Currency value object."""
    
    def test_create_valid_currency(self):
        """Test creating valid currency."""
        currency = Currency("RUB")
        
        assert currency.code == "RUB"
        assert str(currency) == "RUB"
    
    def test_currency_normalization_uppercase(self):
        """Test that currency code is normalized to uppercase."""
        currency = Currency("rub")
        
        assert currency.code == "RUB"
    
    def test_create_invalid_currency_empty(self):
        """Test creating currency with empty code."""
        with pytest.raises(ValueError, match="Invalid currency code"):
            Currency("")
    
    def test_create_invalid_currency_none(self):
        """Test creating currency with None."""
        with pytest.raises(ValueError):
            Currency(None)
    
    def test_equals(self):
        """Test equals method."""
        currency1 = Currency("RUB")
        currency2 = Currency("rub")
        currency3 = Currency("USD")
        
        assert currency1.equals(currency2) is True
        assert currency1.equals(currency3) is False
    
    def test_predefined_currencies(self):
        """Test predefined currency constants."""
        assert Currency.RUB.code == "RUB"
        assert Currency.USD.code == "USD"
        assert Currency.EUR.code == "EUR"
    
    def test_currency_equality(self):
        """Test currency equality."""
        currency1 = Currency("RUB")
        currency2 = Currency("rub")
        
        assert currency1 == currency2

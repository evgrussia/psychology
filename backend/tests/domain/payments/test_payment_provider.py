"""
Tests for PaymentProvider Value Object.
"""
import pytest
from domain.payments.value_objects.payment_provider import PaymentProvider


class TestPaymentProvider:
    """Tests for PaymentProvider value object."""
    
    def test_create_valid_provider(self):
        """Test creating valid payment provider."""
        provider = PaymentProvider('yookassa')
        assert provider.value == 'yookassa'
    
    def test_create_invalid_provider(self):
        """Test creating invalid payment provider."""
        with pytest.raises(ValueError, match="Invalid payment provider"):
            PaymentProvider('invalid')
    
    def test_predefined_providers(self):
        """Test predefined providers."""
        assert PaymentProvider.YOOKASSA.value == 'yookassa'
        assert PaymentProvider.STRIPE.value == 'stripe'
        assert PaymentProvider.PAYPAL.value == 'paypal'
    
    def test_equality(self):
        """Test PaymentProvider equality."""
        provider1 = PaymentProvider('yookassa')
        provider2 = PaymentProvider('yookassa')
        provider3 = PaymentProvider('stripe')
        
        assert provider1 == provider2
        assert provider1 != provider3
        assert provider1 == PaymentProvider.YOOKASSA
    
    def test_hash(self):
        """Test PaymentProvider hashability."""
        provider1 = PaymentProvider('yookassa')
        provider2 = PaymentProvider('yookassa')
        
        assert hash(provider1) == hash(provider2)
        assert provider1 in {provider1, provider2}

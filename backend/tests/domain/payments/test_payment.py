"""
Tests for Payment Aggregate Root.
"""
import pytest
from datetime import datetime, timezone
from domain.payments.aggregates.payment import Payment, PaymentId
from domain.payments.value_objects.payment_status import PaymentStatus
from domain.payments.value_objects.payment_provider import PaymentProvider
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.payments.domain_events import (
    PaymentIntentCreatedEvent,
    PaymentSucceededEvent,
    PaymentFailedEvent
)
from domain.shared.exceptions import DomainError


class TestPayment:
    """Tests for Payment aggregate root."""
    
    def test_create_intent(self):
        """Test creating payment intent."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        
        assert payment.amount == money
        assert payment.status == PaymentStatus.INTENT
        assert payment.provider == provider
        assert payment.provider_payment_id == ""
        assert len(payment.get_domain_events()) == 1
        assert isinstance(payment.get_domain_events()[0], PaymentIntentCreatedEvent)
    
    def test_mark_as_pending(self):
        """Test marking payment as pending."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        
        payment.mark_as_pending("provider_payment_123")
        
        assert payment.status == PaymentStatus.PENDING
        assert payment.provider_payment_id == "provider_payment_123"
    
    def test_mark_as_pending_from_wrong_status(self):
        """Test that pending can only be set from intent status."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        payment.mark_as_pending("provider_payment_123")
        
        with pytest.raises(DomainError, match="Payment is not in intent state"):
            payment.mark_as_pending("another_id")
    
    def test_mark_as_succeeded(self):
        """Test marking payment as succeeded."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        payment.mark_as_pending("provider_payment_123")
        payment.clear_domain_events()
        
        payment.mark_as_succeeded()
        
        assert payment.status == PaymentStatus.SUCCEEDED
        assert payment.confirmed_at is not None
        assert len(payment.get_domain_events()) == 1
        assert isinstance(payment.get_domain_events()[0], PaymentSucceededEvent)
    
    def test_mark_as_succeeded_from_wrong_status(self):
        """Test that succeeded can only be set from pending status."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        
        with pytest.raises(DomainError, match="Payment is not in pending state"):
            payment.mark_as_succeeded()
    
    def test_mark_as_failed(self):
        """Test marking payment as failed."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        payment.mark_as_pending("provider_payment_123")
        payment.clear_domain_events()
        
        payment.mark_as_failed("Insufficient funds")
        
        assert payment.status == PaymentStatus.FAILED
        assert len(payment.get_domain_events()) == 1
        assert isinstance(payment.get_domain_events()[0], PaymentFailedEvent)
    
    def test_mark_as_failed_from_wrong_status(self):
        """Test that failed can only be set from pending status."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        
        with pytest.raises(DomainError, match="Payment is not in pending state"):
            payment.mark_as_failed("Error")
    
    def test_is_succeeded(self):
        """Test checking if payment is succeeded."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        assert not payment.is_succeeded()
        
        payment.mark_as_pending("provider_payment_123")
        assert not payment.is_succeeded()
        
        payment.mark_as_succeeded()
        assert payment.is_succeeded()
    
    def test_payment_properties(self):
        """Test payment properties."""
        money = Money(amount=1000.0, currency=Currency.RUB)
        provider = PaymentProvider.YOOKASSA
        payment = Payment.create_intent(
            amount=money,
            provider=provider
        )
        
        assert isinstance(payment.id, PaymentId)
        assert payment.amount == money
        assert payment.status == PaymentStatus.INTENT
        assert payment.provider == provider

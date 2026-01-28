"""
Tests for PaymentStatus Value Object.
"""
import pytest
from domain.payments.value_objects.payment_status import PaymentStatus


class TestPaymentStatus:
    """Tests for PaymentStatus value object."""
    
    def test_create_valid_status(self):
        """Test creating valid payment status."""
        status = PaymentStatus('intent')
        assert status.value == 'intent'
    
    def test_create_invalid_status(self):
        """Test creating invalid payment status."""
        with pytest.raises(ValueError, match="Invalid payment status"):
            PaymentStatus('invalid')
    
    def test_predefined_statuses(self):
        """Test predefined statuses."""
        assert PaymentStatus.INTENT.value == 'intent'
        assert PaymentStatus.PENDING.value == 'pending'
        assert PaymentStatus.SUCCEEDED.value == 'succeeded'
        assert PaymentStatus.FAILED.value == 'failed'
        assert PaymentStatus.REFUNDED.value == 'refunded'
    
    def test_equality(self):
        """Test PaymentStatus equality."""
        status1 = PaymentStatus('intent')
        status2 = PaymentStatus('intent')
        status3 = PaymentStatus('pending')
        
        assert status1 == status2
        assert status1 != status3
        assert status1 == PaymentStatus.INTENT
    
    def test_hash(self):
        """Test PaymentStatus hashability."""
        status1 = PaymentStatus('intent')
        status2 = PaymentStatus('intent')
        
        assert hash(status1) == hash(status2)
        assert status1 in {status1, status2}

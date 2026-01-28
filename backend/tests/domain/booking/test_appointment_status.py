"""
Tests for AppointmentStatus Value Object.
"""
import pytest
from domain.booking.value_objects.appointment_status import AppointmentStatus


class TestAppointmentStatus:
    """Tests for AppointmentStatus value object."""
    
    def test_create_valid_status(self):
        """Test creating valid status."""
        status = AppointmentStatus('confirmed')
        
        assert status.value == 'confirmed'
    
    def test_create_invalid_status(self):
        """Test creating invalid status."""
        with pytest.raises(ValueError, match="Invalid appointment status"):
            AppointmentStatus('invalid')
    
    def test_is_pending_payment(self):
        """Test is_pending_payment method."""
        status = AppointmentStatus('pending_payment')
        
        assert status.is_pending_payment() is True
        assert AppointmentStatus('confirmed').is_pending_payment() is False
    
    def test_is_confirmed(self):
        """Test is_confirmed method."""
        status = AppointmentStatus('confirmed')
        
        assert status.is_confirmed() is True
        assert AppointmentStatus('pending_payment').is_confirmed() is False
    
    def test_is_completed(self):
        """Test is_completed method."""
        status = AppointmentStatus('completed')
        
        assert status.is_completed() is True
        assert AppointmentStatus('confirmed').is_completed() is False
    
    def test_predefined_statuses(self):
        """Test predefined status constants."""
        assert AppointmentStatus.PENDING_PAYMENT.value == 'pending_payment'
        assert AppointmentStatus.CONFIRMED.value == 'confirmed'
        assert AppointmentStatus.CANCELED.value == 'canceled'
        assert AppointmentStatus.RESCHEDULED.value == 'rescheduled'
        assert AppointmentStatus.COMPLETED.value == 'completed'
        assert AppointmentStatus.NO_SHOW.value == 'no_show'
    
    def test_status_equality(self):
        """Test status equality."""
        status1 = AppointmentStatus('confirmed')
        status2 = AppointmentStatus('confirmed')
        status3 = AppointmentStatus('canceled')
        
        assert status1 == status2
        assert status1 != status3

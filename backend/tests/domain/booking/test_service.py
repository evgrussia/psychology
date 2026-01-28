"""
Tests for Service Aggregate Root.
"""
import pytest
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.value_objects.appointment_format import AppointmentFormat


class TestService:
    """Tests for Service aggregate root."""
    
    def test_create_service(self):
        """Test creating service."""
        service = Service(
            id=ServiceId.generate(),
            slug="consultation",
            name="Консультация",
            description="Первичная консультация",
            price=Money(5000.0, Currency.RUB),
            duration_minutes=60,
            supported_formats=[AppointmentFormat.ONLINE, AppointmentFormat.OFFLINE],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6
        )
        
        assert service.slug == "consultation"
        assert service.name == "Консультация"
        assert service.price.amount == 5000.0
        assert service.duration_minutes == 60
        assert service.cancel_free_hours == 24
        assert service.cancel_partial_hours == 12
        assert service.reschedule_min_hours == 6
    
    def test_is_available_for(self):
        """Test is_available_for method."""
        service = Service(
            id=ServiceId.generate(),
            slug="consultation",
            name="Консультация",
            description="Первичная консультация",
            price=Money(5000.0, Currency.RUB),
            duration_minutes=60,
            supported_formats=[AppointmentFormat.ONLINE, AppointmentFormat.OFFLINE],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6
        )
        
        assert service.is_available_for(AppointmentFormat.ONLINE) is True
        assert service.is_available_for(AppointmentFormat.OFFLINE) is True
        assert service.is_available_for(AppointmentFormat.HYBRID) is False

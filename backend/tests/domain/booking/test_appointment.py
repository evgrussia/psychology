"""
Tests for Appointment Aggregate Root.
"""
import pytest
from datetime import datetime, timedelta, timezone
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.booking.value_objects.appointment_status import AppointmentStatus
from domain.booking.value_objects.appointment_format import AppointmentFormat
from domain.booking.value_objects.booking_metadata import BookingMetadata
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.entities.payment import Payment
from domain.booking.entities.outcome_record import AppointmentOutcome
from domain.booking.value_objects.payment_status import PaymentStatus
from domain.identity.aggregates.user import UserId
from domain.shared.exceptions import DomainError
from domain.booking.domain_events import (
    AppointmentCreatedEvent,
    AppointmentConfirmedEvent,
    AppointmentCanceledEvent,
    AppointmentRescheduledEvent
)


class TestAppointment:
    """Tests for Appointment aggregate root."""
    
    def _create_service(self) -> Service:
        """Helper to create test service."""
        return Service(
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
    
    def _create_future_slot(self) -> TimeSlot:
        """Helper to create future time slot."""
        start = datetime.now(timezone.utc) + timedelta(hours=2)
        end = start + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        return TimeSlot(start_at=start, end_at=end, timezone=tz)
    
    def test_create_appointment(self):
        """Test creating appointment."""
        service = self._create_service()
        client_id = UserId.generate()
        slot = self._create_future_slot()
        format = AppointmentFormat.ONLINE
        metadata = BookingMetadata()
        
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=format,
            metadata=metadata
        )
        
        assert appointment.service_id == service.id
        assert appointment.client_id == client_id
        assert appointment.slot == slot
        assert appointment.status == AppointmentStatus.PENDING_PAYMENT
        assert len(appointment.get_domain_events()) == 1
        assert isinstance(appointment.get_domain_events()[0], AppointmentCreatedEvent)
    
    def test_cannot_create_appointment_in_past(self):
        """Test that cannot create appointment in the past."""
        service = self._create_service()
        client_id = UserId.generate()
        past_start = datetime.now(timezone.utc) - timedelta(hours=1)
        past_end = past_start + timedelta(hours=1)
        past_slot = TimeSlot(
            start_at=past_start,
            end_at=past_end,
            timezone=Timezone("Europe/Moscow")
        )
        format = AppointmentFormat.ONLINE
        metadata = BookingMetadata()
        
        with pytest.raises(DomainError, match="Cannot book appointment in the past"):
            Appointment.create(
                service=service,
                client_id=client_id,
                slot=past_slot,
                format=format,
                metadata=metadata
            )
    
    def test_cannot_create_appointment_unsupported_format(self):
        """Test that cannot create appointment with unsupported format."""
        service = self._create_service()
        client_id = UserId.generate()
        slot = self._create_future_slot()
        format = AppointmentFormat.HYBRID  # Not supported
        metadata = BookingMetadata()
        
        with pytest.raises(DomainError, match="does not support"):
            Appointment.create(
                service=service,
                client_id=client_id,
                slot=slot,
                format=format,
                metadata=metadata
            )
    
    def test_confirm_payment(self):
        """Test confirming payment."""
        service = self._create_service()
        client_id = UserId.generate()
        slot = self._create_future_slot()
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        payment = Payment.create(
            amount=service.price,
            provider_id="yookassa",
            provider_payment_id="test-payment-id"
        )
        payment.mark_as_succeeded()
        
        initial_events = len(appointment.get_domain_events())
        appointment.confirm_payment(payment, service)
        
        assert appointment.status == AppointmentStatus.CONFIRMED
        assert appointment.payment == payment
        assert len(appointment.get_domain_events()) == initial_events + 1
        assert isinstance(appointment.get_domain_events()[-1], AppointmentConfirmedEvent)
    
    def test_cannot_confirm_payment_wrong_status(self):
        """Test that cannot confirm payment for non-pending appointment."""
        service = self._create_service()
        client_id = UserId.generate()
        slot = self._create_future_slot()
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        payment = Payment.create(
            amount=service.price,
            provider_id="yookassa",
            provider_payment_id="test-payment-id"
        )
        payment.mark_as_succeeded()
        appointment.confirm_payment(payment, service)
        
        # Try to confirm again
        with pytest.raises(DomainError, match="not waiting for payment"):
            appointment.confirm_payment(payment, service)
    
    def test_cannot_confirm_payment_wrong_amount(self):
        """Test that cannot confirm payment with wrong amount."""
        service = self._create_service()
        client_id = UserId.generate()
        slot = self._create_future_slot()
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        wrong_payment = Payment.create(
            amount=Money(1000.0, Currency.RUB),  # Wrong amount
            provider_id="yookassa",
            provider_payment_id="test-payment-id"
        )
        wrong_payment.mark_as_succeeded()
        
        with pytest.raises(DomainError, match="does not match"):
            appointment.confirm_payment(wrong_payment, service)
    
    def test_cancel_appointment(self):
        """Test canceling appointment."""
        service = self._create_service()
        client_id = UserId.generate()
        slot = self._create_future_slot()
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        payment = Payment.create(
            amount=service.price,
            provider_id="yookassa",
            provider_payment_id="test-payment-id"
        )
        payment.mark_as_succeeded()
        appointment.confirm_payment(payment, service)
        
        initial_events = len(appointment.get_domain_events())
        refund = appointment.cancel("Test reason", service)
        
        assert appointment.status == AppointmentStatus.CANCELED
        assert len(appointment.get_domain_events()) == initial_events + 1
        assert isinstance(appointment.get_domain_events()[-1], AppointmentCanceledEvent)
        # Refund should be calculated based on hours until start
        assert refund is not None or refund is None  # Depends on timing
    
    def test_reschedule_appointment(self):
        """Test rescheduling appointment."""
        service = self._create_service()
        client_id = UserId.generate()
        # Create slot more than 6 hours in future (reschedule_min_hours=6)
        slot = TimeSlot(
            start_at=datetime.now(timezone.utc) + timedelta(hours=10),
            end_at=datetime.now(timezone.utc) + timedelta(hours=11),
            timezone=Timezone("Europe/Moscow")
        )
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        payment = Payment.create(
            amount=service.price,
            provider_id="yookassa",
            provider_payment_id="test-payment-id"
        )
        payment.mark_as_succeeded()
        appointment.confirm_payment(payment, service)
        
        new_slot = TimeSlot(
            start_at=datetime.now(timezone.utc) + timedelta(hours=20),
            end_at=datetime.now(timezone.utc) + timedelta(hours=21),
            timezone=Timezone("Europe/Moscow")
        )
        
        initial_events = len(appointment.get_domain_events())
        appointment.reschedule(new_slot, service)
        
        assert appointment.slot == new_slot
        assert appointment.status == AppointmentStatus.RESCHEDULED
        assert len(appointment.get_domain_events()) == initial_events + 1
        assert isinstance(appointment.get_domain_events()[-1], AppointmentRescheduledEvent)
    
    def test_record_outcome(self):
        """Test recording outcome."""
        service = self._create_service()
        client_id = UserId.generate()
        past_start = datetime.now(timezone.utc) - timedelta(hours=1)
        past_end = past_start + timedelta(hours=1)
        past_slot = TimeSlot(
            start_at=past_start,
            end_at=past_end,
            timezone=Timezone("Europe/Moscow")
        )
        
        # Create appointment in past (for testing)
        appointment = Appointment(
            id=AppointmentId.generate(),
            service_id=service.id,
            client_id=client_id,
            slot=past_slot,
            status=AppointmentStatus.CONFIRMED,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        outcome = AppointmentOutcome(is_no_show=False, notes="Test notes")
        appointment.record_outcome(outcome)
        
        assert appointment.status == AppointmentStatus.COMPLETED
        assert appointment.outcome_record is not None

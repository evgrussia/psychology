"""
Unit-тесты для Booking Serializers (Phase 5).
"""
import pytest
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from rest_framework.exceptions import ValidationError
from presentation.api.v1.serializers.booking import (
    CreateAppointmentSerializer,
    ServiceSerializer,
    SlotSerializer,
    SlotListSerializer,
    AppointmentSerializer,
    AppointmentListSerializer,
    PaymentInfoSerializer,
)


@pytest.mark.django_db
class TestCreateAppointmentSerializer:
    """Тесты для CreateAppointmentSerializer."""

    def test_valid_data_with_slot_id(self):
        """Валидные данные с slot_id."""
        serializer = CreateAppointmentSerializer(
            data={
                "service_id": str(uuid4()),
                "slot_id": str(uuid4()),
                "format": "online",
            }
        )
        assert serializer.is_valid()
        assert serializer.validated_data["format"] == "online"

    def test_valid_data_with_start_end(self):
        """Валидные данные с start_at/end_at."""
        start = datetime.now(timezone.utc) + timedelta(days=1)
        end = start + timedelta(hours=1)
        serializer = CreateAppointmentSerializer(
            data={
                "service_id": str(uuid4()),
                "start_at": start.isoformat(),
                "end_at": end.isoformat(),
                "format": "online",
                "timezone": "Europe/Moscow",
            }
        )
        assert serializer.is_valid()

    def test_missing_service_id(self):
        """Отсутствует service_id."""
        serializer = CreateAppointmentSerializer(
            data={"slot_id": str(uuid4()), "format": "online"}
        )
        assert not serializer.is_valid()
        assert "service_id" in serializer.errors

    def test_missing_slot_and_datetime(self):
        """Нет ни slot_id, ни start_at/end_at."""
        serializer = CreateAppointmentSerializer(
            data={"service_id": str(uuid4()), "format": "online"}
        )
        assert not serializer.is_valid()
        assert "non_field_errors" in serializer.errors

    def test_invalid_format(self):
        """Невалидный format."""
        serializer = CreateAppointmentSerializer(
            data={
                "service_id": str(uuid4()),
                "slot_id": str(uuid4()),
                "format": "invalid",
            }
        )
        assert not serializer.is_valid()
        assert "format" in serializer.errors

    def test_optional_consents_intake_form(self):
        """Опциональные consents и intake_form."""
        serializer = CreateAppointmentSerializer(
            data={
                "service_id": str(uuid4()),
                "slot_id": str(uuid4()),
                "format": "online",
                "consents": {"personal_data": True},
                "intake_form": {"q1": "a1"},
                "entry_point": "web",
            }
        )
        assert serializer.is_valid()


@pytest.mark.django_db
class TestServiceSerializer:
    """Тесты для ServiceSerializer (output)."""

    def test_valid_service_data(self):
        """Валидная структура услуги."""
        data = {
            "id": uuid4(),
            "slug": "consultation-online",
            "title": "Консультация",
            "description": "Описание",
            "duration_minutes": 60,
            "price_amount": "5000.00",
            "deposit_amount": "2000.00",
            "format": "online",
            "cancel_free_hours": 24,
            "cancel_partial_hours": 12,
            "reschedule_min_hours": 6,
        }
        serializer = ServiceSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestSlotSerializer:
    """Тесты для SlotSerializer (output)."""

    def test_valid_slot_data(self):
        """Валидная структура слота."""
        start = datetime.now(timezone.utc)
        end = start + timedelta(hours=1)
        data = {
            "id": uuid4(),
            "start_at": start.isoformat(),
            "end_at": end.isoformat(),
            "timezone": "UTC",
            "available": True,
        }
        serializer = SlotSerializer(data=data)
        assert serializer.is_valid()


@pytest.mark.django_db
class TestAppointmentSerializer:
    """Тесты для AppointmentSerializer (output)."""

    def test_valid_appointment_data(self):
        """Валидная структура записи."""
        data = {
            "id": str(uuid4()),
            "service": {"id": str(uuid4()), "title": "Услуга"},
            "slot": {"id": str(uuid4()), "start_at": "2026-02-01T10:00:00Z"},
            "status": "confirmed",
            "format": "online",
            "payment": None,
            "created_at": "2026-01-27T12:00:00Z",
        }
        serializer = AppointmentSerializer(data=data)
        assert serializer.is_valid()

    def test_invalid_status(self):
        """Невалидный status."""
        data = {
            "id": str(uuid4()),
            "service": {},
            "slot": {},
            "status": "invalid_status",
            "created_at": "2026-01-27T12:00:00Z",
        }
        serializer = AppointmentSerializer(data=data)
        assert not serializer.is_valid()
        assert "status" in serializer.errors


@pytest.mark.django_db
class TestPaymentInfoSerializer:
    """Тесты для PaymentInfoSerializer."""

    def test_valid_payment_data(self):
        """Валидная структура платежа."""
        data = {
            "id": uuid4(),
            "status": "confirmed",
            "amount": "2000.00",
            "currency": "RUB",
        }
        serializer = PaymentInfoSerializer(data=data)
        assert serializer.is_valid()

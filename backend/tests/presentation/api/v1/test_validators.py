"""
Unit-тесты для API Validators (Phase 5).
"""
import pytest
from datetime import datetime, timezone, timedelta

from rest_framework import serializers
from presentation.api.v1.validators import (
    TimezoneValidator,
    FutureDateValidator,
    SlotDurationValidator,
)


@pytest.mark.django_db
class TestTimezoneValidator:
    """Тесты для TimezoneValidator."""

    def test_valid_timezone(self):
        """Валидная IANA таймзона."""
        v = TimezoneValidator()
        v("Europe/Moscow")
        v("UTC")
        v("America/New_York")

    def test_invalid_timezone(self):
        """Невалидная таймзона."""
        v = TimezoneValidator()
        with pytest.raises(serializers.ValidationError) as exc_info:
            v("Invalid/Timezone")
        assert "Invalid timezone" in str(exc_info.value)


@pytest.mark.django_db
class TestFutureDateValidator:
    """Тесты для FutureDateValidator."""

    def test_future_datetime(self):
        """Дата в будущем."""
        v = FutureDateValidator()
        future = datetime.now(timezone.utc) + timedelta(days=1)
        v(future)

    def test_future_iso_string(self):
        """Строка ISO в будущем."""
        v = FutureDateValidator()
        future = datetime.now(timezone.utc) + timedelta(hours=1)
        v(future.isoformat())

    def test_past_datetime_raises(self):
        """Дата в прошлом — ошибка."""
        v = FutureDateValidator()
        past = datetime.now(timezone.utc) - timedelta(days=1)
        with pytest.raises(serializers.ValidationError) as exc_info:
            v(past)
        assert "future" in str(exc_info.value).lower()

    def test_invalid_format_raises(self):
        """Невалидный формат строки."""
        v = FutureDateValidator()
        with pytest.raises(serializers.ValidationError) as exc_info:
            v("not-a-date")
        assert "Invalid" in str(exc_info.value) or "format" in str(exc_info.value).lower()


@pytest.mark.django_db
class TestSlotDurationValidator:
    """Тесты для SlotDurationValidator."""

    def test_valid_duration(self):
        """Длительность в допустимых пределах."""
        v = SlotDurationValidator(min_minutes=15, max_minutes=480)
        start = datetime.now(timezone.utc) + timedelta(days=1)
        end = start + timedelta(hours=1)
        v({"start_at": start, "end_at": end})

    def test_valid_duration_iso_strings(self):
        """start_at/end_at как ISO-строки."""
        v = SlotDurationValidator(min_minutes=15, max_minutes=60)
        start = datetime.now(timezone.utc) + timedelta(days=1)
        end = start + timedelta(minutes=30)
        v({
            "start_at": start.isoformat(),
            "end_at": end.isoformat(),
        })

    def test_too_short_duration_raises(self):
        """Длительность меньше min_minutes."""
        v = SlotDurationValidator(min_minutes=15, max_minutes=480)
        start = datetime.now(timezone.utc) + timedelta(days=1)
        end = start + timedelta(minutes=5)
        with pytest.raises(serializers.ValidationError) as exc_info:
            v({"start_at": start, "end_at": end})
        assert "least" in str(exc_info.value).lower() or "15" in str(exc_info.value)

    def test_too_long_duration_raises(self):
        """Длительность больше max_minutes."""
        v = SlotDurationValidator(min_minutes=15, max_minutes=60)
        start = datetime.now(timezone.utc) + timedelta(days=1)
        end = start + timedelta(hours=2)
        with pytest.raises(serializers.ValidationError) as exc_info:
            v({"start_at": start, "end_at": end})
        assert "exceed" in str(exc_info.value).lower() or "60" in str(exc_info.value)

    def test_not_dict_raises(self):
        """Не dict — ошибка."""
        v = SlotDurationValidator()
        with pytest.raises(serializers.ValidationError) as exc_info:
            v("not a dict")
        assert "dictionary" in str(exc_info.value).lower()

    def test_missing_start_or_end_raises(self):
        """Отсутствует start_at или end_at."""
        v = SlotDurationValidator()
        with pytest.raises(serializers.ValidationError) as exc_info:
            v({"start_at": datetime.now(timezone.utc)})
        assert "start_at" in str(exc_info.value) or "end_at" in str(exc_info.value)

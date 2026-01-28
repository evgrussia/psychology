"""
Tests for TimeSlot Value Object.
"""
import pytest
from datetime import datetime, timedelta, timezone
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.shared.exceptions import DomainError


class TestTimeSlot:
    """Tests for TimeSlot value object."""
    
    def test_create_valid_time_slot(self):
        """Test creating valid time slot."""
        start = datetime.now(timezone.utc) + timedelta(hours=1)
        end = start + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        slot = TimeSlot(start_at=start, end_at=end, timezone=tz)
        
        assert slot.start_at == start
        assert slot.end_at == end
        assert slot.timezone == tz
    
    def test_create_invalid_time_slot_end_before_start(self):
        """Test creating time slot with end before start."""
        start = datetime.now(timezone.utc) + timedelta(hours=1)
        end = start - timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        with pytest.raises(DomainError, match="End time must be after start time"):
            TimeSlot(start_at=start, end_at=end, timezone=tz)
    
    def test_create_invalid_time_slot_end_equal_start(self):
        """Test creating time slot with end equal to start."""
        start = datetime.now(timezone.utc) + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        with pytest.raises(DomainError, match="End time must be after start time"):
            TimeSlot(start_at=start, end_at=start, timezone=tz)
    
    def test_is_in_past(self):
        """Test is_in_past method."""
        past_start = datetime.now(timezone.utc) - timedelta(hours=2)
        past_end = past_start + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        past_slot = TimeSlot(start_at=past_start, end_at=past_end, timezone=tz)
        
        assert past_slot.is_in_past() is True
    
    def test_is_in_future(self):
        """Test is_in_future method."""
        future_start = datetime.now(timezone.utc) + timedelta(hours=2)
        future_end = future_start + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        future_slot = TimeSlot(start_at=future_start, end_at=future_end, timezone=tz)
        
        assert future_slot.is_in_future() is True
    
    def test_hours_until_start(self):
        """Test hours_until_start method."""
        start = datetime.now(timezone.utc) + timedelta(hours=2, minutes=30)
        end = start + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        slot = TimeSlot(start_at=start, end_at=end, timezone=tz)
        
        hours = slot.hours_until_start()
        assert 2.4 <= hours <= 2.6  # Allow small time difference
    
    def test_overlaps(self):
        """Test overlaps method."""
        base_start = datetime.now(timezone.utc) + timedelta(hours=1)
        base_end = base_start + timedelta(hours=1)
        tz = Timezone("Europe/Moscow")
        
        slot1 = TimeSlot(start_at=base_start, end_at=base_end, timezone=tz)
        
        # Overlapping slot
        overlap_start = base_start + timedelta(minutes=30)
        overlap_end = overlap_start + timedelta(hours=1)
        slot2 = TimeSlot(start_at=overlap_start, end_at=overlap_end, timezone=tz)
        
        # Non-overlapping slot
        no_overlap_start = base_end + timedelta(hours=1)
        no_overlap_end = no_overlap_start + timedelta(hours=1)
        slot3 = TimeSlot(start_at=no_overlap_start, end_at=no_overlap_end, timezone=tz)
        
        assert slot1.overlaps(slot2) is True
        assert slot1.overlaps(slot3) is False
    
    def test_duration_minutes(self):
        """Test duration_minutes method."""
        start = datetime.now(timezone.utc) + timedelta(hours=1)
        end = start + timedelta(hours=1, minutes=30)
        tz = Timezone("Europe/Moscow")
        
        slot = TimeSlot(start_at=start, end_at=end, timezone=tz)
        
        assert slot.duration_minutes() == 90

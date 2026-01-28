"""
Tests for TimeToBenefit Value Object.
"""
import pytest
from domain.content.value_objects.time_to_benefit import TimeToBenefit


class TestTimeToBenefit:
    """Tests for TimeToBenefit value object."""
    
    def test_create_valid_value(self):
        """Test creating valid time to benefit."""
        time = TimeToBenefit(value="short_term")
        assert time.value == "short_term"
        assert time.minutes == 15
    
    def test_create_invalid_value(self):
        """Test that invalid value raises error."""
        with pytest.raises(ValueError, match="Invalid time to benefit"):
            TimeToBenefit(value="invalid")
    
    def test_equality(self):
        """Test TimeToBenefit equality."""
        time1 = TimeToBenefit(value="short_term")
        time2 = TimeToBenefit(value="short_term")
        time3 = TimeToBenefit(value="long_term")
        
        assert time1 == time2
        assert time1 != time3
    
    def test_hash(self):
        """Test TimeToBenefit hashability."""
        time1 = TimeToBenefit(value="short_term")
        time2 = TimeToBenefit(value="short_term")
        
        assert hash(time1) == hash(time2)
        assert time1 in {time1, time2}

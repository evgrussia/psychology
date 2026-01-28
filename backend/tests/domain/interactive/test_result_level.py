"""
Tests for ResultLevel Value Object.
"""
import pytest
from domain.interactive.value_objects.result_level import ResultLevel


class TestResultLevel:
    """Tests for ResultLevel value object."""
    
    def test_create_valid_level(self):
        """Test creating valid result level."""
        level = ResultLevel('low')
        assert level.value == 'low'
    
    def test_create_invalid_level(self):
        """Test creating invalid result level."""
        with pytest.raises(ValueError, match="Invalid result level"):
            ResultLevel('invalid')
    
    def test_valid_levels(self):
        """Test all valid levels."""
        assert ResultLevel('low').value == 'low'
        assert ResultLevel('medium').value == 'medium'
        assert ResultLevel('high').value == 'high'
        assert ResultLevel('critical').value == 'critical'
    
    def test_equality(self):
        """Test ResultLevel equality."""
        level1 = ResultLevel('low')
        level2 = ResultLevel('low')
        level3 = ResultLevel('high')
        
        assert level1 == level2
        assert level1 != level3
    
    def test_hash(self):
        """Test ResultLevel hashability."""
        level1 = ResultLevel('low')
        level2 = ResultLevel('low')
        
        assert hash(level1) == hash(level2)
        assert level1 in {level1, level2}

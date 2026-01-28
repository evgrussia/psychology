"""
Tests for InteractiveResult Value Object.
"""
import pytest
from domain.interactive.value_objects.interactive_result import InteractiveResult
from domain.interactive.value_objects.result_level import ResultLevel


class TestInteractiveResult:
    """Tests for InteractiveResult value object."""
    
    def test_create_with_level_only(self):
        """Test creating result with level only."""
        result = InteractiveResult(level=ResultLevel('medium'))
        
        assert result.level == ResultLevel('medium')
        assert result.profile == {}
        assert result.crisis_detected is False
    
    def test_create_with_profile(self):
        """Test creating result with profile."""
        profile = {"key1": "value1", "key2": 123}
        result = InteractiveResult(
            level=ResultLevel('medium'),
            profile=profile
        )
        
        assert result.level == ResultLevel('medium')
        assert result.profile == profile
    
    def test_create_with_crisis(self):
        """Test creating result with crisis detected."""
        result = InteractiveResult(
            level=ResultLevel('high'),
            crisis_detected=True
        )
        
        assert result.crisis_detected is True
    
    def test_profile_is_copied(self):
        """Test that profile is copied."""
        original_profile = {"key": "value"}
        result = InteractiveResult(
            level=ResultLevel('medium'),
            profile=original_profile
        )
        
        # Modify original should not affect result
        original_profile["new_key"] = "new_value"
        assert "new_key" not in result.profile
    
    def test_equality(self):
        """Test InteractiveResult equality."""
        result1 = InteractiveResult(level=ResultLevel('medium'))
        result2 = InteractiveResult(level=ResultLevel('medium'))
        result3 = InteractiveResult(level=ResultLevel('high'))
        
        assert result1 == result2
        assert result1 != result3
    
    def test_hash(self):
        """Test InteractiveResult hashability."""
        result1 = InteractiveResult(level=ResultLevel('medium'))
        result2 = InteractiveResult(level=ResultLevel('medium'))
        
        assert hash(result1) == hash(result2)
        assert result1 in {result1, result2}

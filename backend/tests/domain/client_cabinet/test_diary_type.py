"""
Tests for DiaryType Value Object.
"""
import pytest
from domain.client_cabinet.value_objects.diary_type import DiaryType


class TestDiaryType:
    """Tests for DiaryType value object."""
    
    def test_create_valid_type(self):
        """Test creating valid diary type."""
        diary_type = DiaryType('mood')
        assert diary_type.value == 'mood'
    
    def test_create_invalid_type(self):
        """Test creating invalid diary type."""
        with pytest.raises(ValueError, match="Invalid diary type"):
            DiaryType('invalid')
    
    def test_valid_types(self):
        """Test valid diary types."""
        assert DiaryType('mood').value == 'mood'
        assert DiaryType('note').value == 'note'
        assert DiaryType('event').value == 'event'
        assert DiaryType('emotion').value == 'emotion'
    
    def test_equality(self):
        """Test DiaryType equality."""
        type1 = DiaryType('mood')
        type2 = DiaryType('mood')
        type3 = DiaryType('note')
        
        assert type1 == type2
        assert type1 != type3
    
    def test_hash(self):
        """Test DiaryType hashability."""
        type1 = DiaryType('mood')
        type2 = DiaryType('mood')
        
        assert hash(type1) == hash(type2)
        assert type1 in {type1, type2}

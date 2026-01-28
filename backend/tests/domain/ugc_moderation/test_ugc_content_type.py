"""
Tests for UGCContentType Value Object.
"""
import pytest
from domain.ugc_moderation.value_objects.ugc_content_type import UGCContentType


class TestUGCContentType:
    """Tests for UGCContentType value object."""
    
    def test_create_valid_type(self):
        """Test creating valid UGC content type."""
        content_type = UGCContentType('question')
        assert content_type.value == 'question'
    
    def test_create_invalid_type(self):
        """Test creating invalid UGC content type."""
        with pytest.raises(ValueError, match="Invalid UGC content type"):
            UGCContentType('invalid')
    
    def test_valid_types(self):
        """Test all valid UGC content types."""
        assert UGCContentType('question').value == 'question'
        assert UGCContentType('review').value == 'review'
        assert UGCContentType('comment').value == 'comment'
    
    def test_equality(self):
        """Test UGCContentType equality."""
        type1 = UGCContentType('question')
        type2 = UGCContentType('question')
        type3 = UGCContentType('review')
        
        assert type1 == type2
        assert type1 != type3
    
    def test_hash(self):
        """Test UGCContentType hashability."""
        type1 = UGCContentType('question')
        type2 = UGCContentType('question')
        
        assert hash(type1) == hash(type2)
        assert type1 in {type1, type2}

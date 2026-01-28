"""
Tests for ContentType Value Object.
"""
import pytest
from domain.content.value_objects.content_type import ContentType


class TestContentType:
    """Tests for ContentType value object."""
    
    def test_create_valid_type(self):
        """Test creating valid content type."""
        content_type = ContentType('article')
        assert content_type.value == 'article'
    
    def test_create_invalid_type(self):
        """Test creating invalid content type."""
        with pytest.raises(ValueError, match="Invalid content type"):
            ContentType('invalid')
    
    def test_valid_types(self):
        """Test all valid content types."""
        assert ContentType('article').value == 'article'
        assert ContentType('resource').value == 'resource'
        assert ContentType('landing').value == 'landing'
        assert ContentType('quiz').value == 'quiz'
    
    def test_equality(self):
        """Test ContentType equality."""
        type1 = ContentType('article')
        type2 = ContentType('article')
        type3 = ContentType('resource')
        
        assert type1 == type2
        assert type1 != type3
    
    def test_hash(self):
        """Test ContentType hashability."""
        type1 = ContentType('article')
        type2 = ContentType('article')
        
        assert hash(type1) == hash(type2)
        assert type1 in {type1, type2}

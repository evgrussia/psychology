"""
Tests for TopicCode Value Object.
"""
import pytest
from domain.content.value_objects.topic_code import TopicCode


class TestTopicCode:
    """Tests for TopicCode value object."""
    
    def test_create_valid_code(self):
        """Test creating valid topic code."""
        code = TopicCode('anxiety')
        assert code.value == 'anxiety'
    
    def test_create_empty_code(self):
        """Test that empty code raises error."""
        with pytest.raises(ValueError, match="Invalid topic code"):
            TopicCode('')
    
    def test_create_invalid_type(self):
        """Test that non-string code raises error."""
        with pytest.raises(ValueError, match="Invalid topic code"):
            TopicCode(None)
    
    def test_equality(self):
        """Test TopicCode equality."""
        code1 = TopicCode('anxiety')
        code2 = TopicCode('anxiety')
        code3 = TopicCode('depression')
        
        assert code1 == code2
        assert code1 != code3
    
    def test_hash(self):
        """Test TopicCode hashability."""
        code1 = TopicCode('anxiety')
        code2 = TopicCode('anxiety')
        
        assert hash(code1) == hash(code2)
        assert code1 in {code1, code2}

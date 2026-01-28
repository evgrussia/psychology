"""
Tests for ContentStatus Value Object.
"""
import pytest
from domain.content.value_objects.content_status import ContentStatus


class TestContentStatus:
    """Tests for ContentStatus value object."""
    
    def test_create_valid_status(self):
        """Test creating valid content status."""
        status = ContentStatus('draft')
        assert status.value == 'draft'
    
    def test_create_invalid_status(self):
        """Test creating invalid content status."""
        with pytest.raises(ValueError, match="Invalid content status"):
            ContentStatus('invalid')
    
    def test_predefined_statuses(self):
        """Test predefined statuses."""
        assert ContentStatus.DRAFT.value == 'draft'
        assert ContentStatus.PUBLISHED.value == 'published'
        assert ContentStatus.ARCHIVED.value == 'archived'
    
    def test_equality(self):
        """Test ContentStatus equality."""
        status1 = ContentStatus('draft')
        status2 = ContentStatus('draft')
        status3 = ContentStatus('published')
        
        assert status1 == status2
        assert status1 != status3
        assert status1 == ContentStatus.DRAFT
    
    def test_hash(self):
        """Test ContentStatus hashability."""
        status1 = ContentStatus('draft')
        status2 = ContentStatus('draft')
        
        assert hash(status1) == hash(status2)
        assert status1 in {status1, status2}

"""
Tests for RunMetadata Value Object.
"""
import pytest
from domain.interactive.value_objects.run_metadata import RunMetadata


class TestRunMetadata:
    """Tests for RunMetadata value object."""
    
    def test_create_with_slug_only(self):
        """Test creating metadata with slug only."""
        metadata = RunMetadata(interactive_slug="test-interactive")
        
        assert metadata.interactive_slug == "test-interactive"
        assert metadata.additional_data == {}
    
    def test_create_with_additional_data(self):
        """Test creating metadata with additional data."""
        additional_data = {"key1": "value1", "key2": 123}
        metadata = RunMetadata(
            interactive_slug="test-interactive",
            additional_data=additional_data
        )
        
        assert metadata.interactive_slug == "test-interactive"
        assert metadata.additional_data == additional_data
    
    def test_additional_data_is_copied(self):
        """Test that additional_data is copied."""
        original_data = {"key": "value"}
        metadata = RunMetadata(
            interactive_slug="test-interactive",
            additional_data=original_data
        )
        
        # Modify original should not affect metadata
        original_data["new_key"] = "new_value"
        assert "new_key" not in metadata.additional_data
    
    def test_equality(self):
        """Test RunMetadata equality."""
        metadata1 = RunMetadata(interactive_slug="test-interactive")
        metadata2 = RunMetadata(interactive_slug="test-interactive")
        metadata3 = RunMetadata(interactive_slug="other-interactive")
        
        assert metadata1 == metadata2
        assert metadata1 != metadata3
    
    def test_hash(self):
        """Test RunMetadata hashability."""
        metadata1 = RunMetadata(interactive_slug="test-interactive")
        metadata2 = RunMetadata(interactive_slug="test-interactive")
        
        assert hash(metadata1) == hash(metadata2)
        assert metadata1 in {metadata1, metadata2}

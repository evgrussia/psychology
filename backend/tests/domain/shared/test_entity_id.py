"""
Tests for EntityId.
"""
import pytest
from uuid import UUID, uuid4
from domain.shared.entity_id import EntityId


class TestId(EntityId):
    """Test EntityId implementation."""
    pass


class TestEntityId:
    """Tests for EntityId base class."""
    
    def test_create_from_string(self):
        """Test creating EntityId from string UUID."""
        uuid_str = str(uuid4())
        entity_id = TestId(uuid_str)
        
        assert entity_id.value == uuid_str
        assert str(entity_id) == uuid_str
    
    def test_create_from_uuid(self):
        """Test creating EntityId from UUID object."""
        uuid_obj = uuid4()
        entity_id = TestId(uuid_obj)
        
        assert entity_id.value == str(uuid_obj)
    
    def test_create_invalid_string(self):
        """Test creating EntityId with invalid string."""
        with pytest.raises(ValueError, match="Invalid UUID format"):
            TestId("invalid-uuid")
    
    def test_create_invalid_type(self):
        """Test creating EntityId with invalid type."""
        with pytest.raises(TypeError, match="EntityId value must be str or UUID"):
            TestId(123)
    
    def test_generate(self):
        """Test generating new EntityId."""
        entity_id = TestId.generate()
        
        assert isinstance(entity_id, TestId)
        assert isinstance(UUID(entity_id.value), UUID)
    
    def test_equality(self):
        """Test EntityId equality."""
        uuid_str = str(uuid4())
        id1 = TestId(uuid_str)
        id2 = TestId(uuid_str)
        id3 = TestId(str(uuid4()))
        
        assert id1 == id2
        assert id1 != id3
        assert id1 != "not-an-id"
    
    def test_hash(self):
        """Test EntityId hashability."""
        uuid_str = str(uuid4())
        id1 = TestId(uuid_str)
        id2 = TestId(uuid_str)
        
        assert hash(id1) == hash(id2)
        assert id1 in {id1, id2}
    
    def test_repr(self):
        """Test EntityId representation."""
        uuid_str = str(uuid4())
        entity_id = TestId(uuid_str)
        
        assert repr(entity_id) == f"TestId({uuid_str})"

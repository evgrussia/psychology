"""
Tests for ValueObject.
"""
import pytest
from domain.shared.value_object import ValueObject


class SampleValueObject(ValueObject):
    """Test ValueObject implementation."""
    
    def __init__(self, value: str, number: int):
        self._value = value
        self._number = number


class TestValueObject:
    """Tests for ValueObject base class."""
    
    def test_equality_same_values(self):
        """Test that ValueObjects with same values are equal."""
        vo1 = SampleValueObject("test", 42)
        vo2 = SampleValueObject("test", 42)
        
        assert vo1 == vo2
        assert hash(vo1) == hash(vo2)
    
    def test_equality_different_values(self):
        """Test that ValueObjects with different values are not equal."""
        vo1 = SampleValueObject("test", 42)
        vo2 = SampleValueObject("test", 43)
        vo3 = SampleValueObject("other", 42)
        
        assert vo1 != vo2
        assert vo1 != vo3
    
    def test_equality_different_types(self):
        """Test that ValueObjects of different types are not equal."""
        vo1 = SampleValueObject("test", 42)
        
        assert vo1 != "not-a-value-object"
        assert vo1 != 42
    
    def test_hash(self):
        """Test that ValueObjects are hashable."""
        vo1 = SampleValueObject("test", 42)
        vo2 = SampleValueObject("test", 42)
        vo3 = SampleValueObject("other", 42)
        
        assert hash(vo1) == hash(vo2)
        assert hash(vo1) != hash(vo3)
        assert vo1 in {vo1, vo2, vo3}
    
    def test_repr(self):
        """Test ValueObject representation."""
        vo = SampleValueObject("test", 42)
        
        repr_str = repr(vo)
        assert "SampleValueObject" in repr_str
        assert "test" in repr_str or "42" in repr_str

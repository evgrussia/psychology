"""
Tests for ExportType Value Object.
"""
import pytest
from domain.client_cabinet.value_objects.export_type import ExportType


class TestExportType:
    """Tests for ExportType value object."""
    
    def test_create_valid_type(self):
        """Test creating valid export type."""
        export_type = ExportType('pdf')
        assert export_type.value == 'pdf'
    
    def test_create_invalid_type(self):
        """Test creating invalid export type."""
        with pytest.raises(ValueError, match="Invalid export type"):
            ExportType('invalid')
    
    def test_valid_types(self):
        """Test valid export types."""
        assert ExportType('pdf').value == 'pdf'
        assert ExportType('json').value == 'json'
        assert ExportType('csv').value == 'csv'
    
    def test_equality(self):
        """Test ExportType equality."""
        type1 = ExportType('pdf')
        type2 = ExportType('pdf')
        type3 = ExportType('json')
        
        assert type1 == type2
        assert type1 != type3
    
    def test_hash(self):
        """Test ExportType hashability."""
        type1 = ExportType('pdf')
        type2 = ExportType('pdf')
        
        assert hash(type1) == hash(type2)
        assert type1 in {type1, type2}

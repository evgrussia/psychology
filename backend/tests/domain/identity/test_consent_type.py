"""
Tests for ConsentType Value Object.
"""
import pytest
from domain.identity.value_objects.consent_type import ConsentType


class TestConsentType:
    """Tests for ConsentType value object."""
    
    def test_create_valid_consent_type(self):
        """Test creating valid consent type."""
        consent_type = ConsentType('personal_data')
        
        assert consent_type.value == 'personal_data'
    
    def test_create_invalid_consent_type(self):
        """Test creating invalid consent type."""
        with pytest.raises(ValueError, match="Invalid consent type"):
            ConsentType('invalid')
    
    def test_predefined_consent_types(self):
        """Test predefined consent type constants."""
        assert ConsentType.PERSONAL_DATA.value == 'personal_data'
        assert ConsentType.COMMUNICATIONS.value == 'communications'
        assert ConsentType.TELEGRAM.value == 'telegram'
        assert ConsentType.REVIEW_PUBLICATION.value == 'review_publication'
    
    def test_consent_type_equality(self):
        """Test consent type equality."""
        type1 = ConsentType('personal_data')
        type2 = ConsentType('personal_data')
        type3 = ConsentType('communications')
        
        assert type1 == type2
        assert type1 != type3
    
    def test_consent_type_hash(self):
        """Test consent type hashability."""
        type1 = ConsentType('personal_data')
        type2 = ConsentType('personal_data')
        
        assert hash(type1) == hash(type2)

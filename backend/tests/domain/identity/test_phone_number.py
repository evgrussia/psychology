"""
Tests for PhoneNumber Value Object.
"""
import pytest
from domain.identity.value_objects.phone_number import PhoneNumber


class TestPhoneNumber:
    """Tests for PhoneNumber value object."""
    
    def test_create_valid_phone(self):
        """Test creating valid phone number."""
        phone = PhoneNumber.create("+79991234567")
        
        assert phone.value == "79991234567"  # Normalized (only digits)
        assert str(phone) == "79991234567"
    
    def test_phone_normalization(self):
        """Test phone number normalization (removes non-digits)."""
        phone1 = PhoneNumber.create("+7 (999) 123-45-67")
        phone2 = PhoneNumber.create("79991234567")
        
        assert phone1.value == phone2.value
        assert phone1 == phone2
    
    def test_create_invalid_phone_too_short(self):
        """Test creating phone with too few digits."""
        with pytest.raises(ValueError, match="Invalid phone number"):
            PhoneNumber.create("12345")  # Less than 10 digits
    
    def test_create_invalid_phone_too_long(self):
        """Test creating phone with too many digits."""
        with pytest.raises(ValueError, match="Invalid phone number"):
            PhoneNumber.create("1234567890123456")  # More than 15 digits
    
    def test_create_invalid_phone_empty(self):
        """Test creating empty phone."""
        with pytest.raises(ValueError, match="Invalid phone number"):
            PhoneNumber.create("")
    
    def test_format_russian_phone(self):
        """Test formatting Russian phone number."""
        phone = PhoneNumber.create("79991234567")
        
        formatted = phone.format()
        assert formatted == "+7 (999) 123-45-67"
    
    def test_format_other_phone(self):
        """Test formatting non-Russian phone number."""
        phone = PhoneNumber.create("1234567890")
        
        formatted = phone.format()
        assert formatted == "1234567890"  # No special formatting
    
    def test_phone_equality(self):
        """Test phone equality."""
        phone1 = PhoneNumber.create("+7 (999) 123-45-67")
        phone2 = PhoneNumber.create("79991234567")
        phone3 = PhoneNumber.create("79991234568")
        
        assert phone1 == phone2  # Same after normalization
        assert phone1 != phone3
    
    def test_phone_hash(self):
        """Test phone hashability."""
        phone1 = PhoneNumber.create("+7 (999) 123-45-67")
        phone2 = PhoneNumber.create("79991234567")
        
        assert hash(phone1) == hash(phone2)

"""
Tests for Email Value Object.
"""
import pytest
from domain.identity.value_objects.email import Email


class TestEmail:
    """Tests for Email value object."""
    
    def test_create_valid_email(self):
        """Test creating valid email."""
        email = Email.create("test@example.com")
        
        assert email.value == "test@example.com"
        assert str(email) == "test@example.com"
    
    def test_email_normalization_lowercase(self):
        """Test that email is normalized to lowercase."""
        email = Email.create("TEST@EXAMPLE.COM")
        
        assert email.value == "test@example.com"
    
    def test_email_normalization_trim(self):
        """Test that email whitespace is trimmed."""
        email = Email.create("  test@example.com  ")
        
        assert email.value == "test@example.com"
    
    def test_create_invalid_email_no_at(self):
        """Test creating email without @."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email.create("invalid-email")
    
    def test_create_invalid_email_no_domain(self):
        """Test creating email without domain."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email.create("test@")
    
    def test_create_invalid_email_no_tld(self):
        """Test creating email without TLD."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email.create("test@example")
    
    def test_create_invalid_email_empty(self):
        """Test creating empty email."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email.create("")
    
    def test_create_invalid_email_none(self):
        """Test creating email with None."""
        with pytest.raises(ValueError):
            Email.create(None)
    
    def test_email_equality(self):
        """Test email equality."""
        email1 = Email.create("test@example.com")
        email2 = Email.create("TEST@EXAMPLE.COM")
        email3 = Email.create("other@example.com")
        
        assert email1 == email2  # Case insensitive
        assert email1 != email3
    
    def test_email_hash(self):
        """Test email hashability."""
        email1 = Email.create("test@example.com")
        email2 = Email.create("TEST@EXAMPLE.COM")
        
        assert hash(email1) == hash(email2)
        assert email1 in {email1, email2}

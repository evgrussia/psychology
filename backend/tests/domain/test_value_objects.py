"""
Тесты для Value Objects.
"""
import pytest

from domain.identity.value_objects import Email, Phone, PasswordHash


class TestEmail:
    """Тесты для Email value object."""
    
    def test_create_valid_email(self):
        """Тест создания валидного email."""
        email = Email("test@example.com")
        assert email.value == "test@example.com"
    
    def test_create_invalid_email_no_at(self):
        """Тест создания email без @."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email("invalid-email")
    
    def test_create_invalid_email_empty(self):
        """Тест создания пустого email."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email("")
    
    def test_create_invalid_email_none(self):
        """Тест создания email с None."""
        with pytest.raises(ValueError, match="Invalid email format"):
            Email(None)
    
    def test_email_immutable(self):
        """Тест неизменяемости email."""
        email = Email("test@example.com")
        with pytest.raises(Exception):  # frozen dataclass не позволяет изменять
            email.value = "new@example.com"


class TestPhone:
    """Тесты для Phone value object."""
    
    def test_create_valid_phone(self):
        """Тест создания валидного телефона."""
        phone = Phone("+79991234567")
        assert phone.value == "+79991234567"
    
    def test_create_invalid_phone_empty(self):
        """Тест создания пустого телефона."""
        with pytest.raises(ValueError, match="Phone number cannot be empty"):
            Phone("")
    
    def test_create_invalid_phone_none(self):
        """Тест создания телефона с None."""
        with pytest.raises(ValueError, match="Phone number cannot be empty"):
            Phone(None)


class TestPasswordHash:
    """Тесты для PasswordHash value object."""
    
    def test_create_password_hash(self):
        """Тест создания password hash."""
        hash_value = "argon2id$v=19$m=65536,t=3,p=4$..."
        password_hash = PasswordHash(hash_value)
        assert password_hash.value == hash_value
    
    def test_from_password_not_implemented(self):
        """Тест, что from_password выбрасывает NotImplementedError."""
        with pytest.raises(NotImplementedError, match="Use infrastructure service"):
            PasswordHash.from_password("password123")

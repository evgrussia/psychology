"""
Тесты для Value Objects.
"""
import pytest

from domain.identity.value_objects import Email, PhoneNumber


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


class TestPhoneNumber:
    """Тесты для PhoneNumber value object."""
    
    def test_create_valid_phone(self):
        """Тест создания валидного телефона."""
        phone = PhoneNumber("+79991234567")
        assert phone.value == "79991234567"
    
    def test_create_invalid_phone_empty(self):
        """Тест создания пустого телефона."""
        with pytest.raises(ValueError):
            PhoneNumber("")
    
    def test_create_invalid_phone_none(self):
        """Тест создания телефона с None."""
        with pytest.raises(TypeError):
            PhoneNumber(None)


# PasswordHash value object удален или перемещен в инфраструктуру.
# Тесты для него удалены, так как он не используется напрямую в домене.

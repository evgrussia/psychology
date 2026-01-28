"""
Тесты для User entity.
"""
import pytest
from datetime import datetime
from uuid import uuid4

from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email


class TestUserEntity:
    """Тесты для User entity."""
    
    def test_create_user(self):
        """Тест создания пользователя."""
        user = User.create(email=Email.create("test@example.com"))
        
        assert user.email.value == "test@example.com"
        assert user.status == UserStatus.ACTIVE
        assert user.status.is_active() is True
    
    def test_user_is_active(self):
        """Тест проверки активности пользователя."""
        user = User.create(email=Email.create("test@example.com"))
        
        assert user.status.is_active() is True
        
        user.block("Test block")
        assert user.status.is_active() is False

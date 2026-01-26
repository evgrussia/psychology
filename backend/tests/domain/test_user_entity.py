"""
Тесты для User entity.
"""
import pytest
from datetime import datetime
from uuid import uuid4

from domain.identity.entities import User, UserStatus


class TestUserEntity:
    """Тесты для User entity."""
    
    def test_create_user(self):
        """Тест создания пользователя."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        assert user.email == "test@example.com"
        assert user.status == UserStatus.ACTIVE
        assert user.is_active() is True
    
    def test_user_is_active(self):
        """Тест проверки активности пользователя."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            deleted_at=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        assert user.is_active() is True
        
        user.status = UserStatus.BLOCKED
        assert user.is_active() is False
        
        user.status = UserStatus.ACTIVE
        user.deleted_at = datetime.utcnow()
        assert user.is_active() is False

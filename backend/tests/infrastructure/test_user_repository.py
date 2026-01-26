"""
Тесты для DjangoUserRepository.
"""
import pytest
from django.test import TestCase
from uuid import uuid4
from datetime import datetime

from domain.identity.entities import User, UserStatus
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.persistence.django_models.user import UserModel


@pytest.mark.django_db
class TestDjangoUserRepository(TestCase):
    """Тесты для DjangoUserRepository."""
    
    def setUp(self):
        self.repository = DjangoUserRepository()
    
    def test_save_and_get_user(self):
        """Тест сохранения и получения пользователя."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        saved_user = self.repository.save(user)
        assert saved_user.id == user.id
        assert saved_user.email == user.email
        
        retrieved_user = self.repository.get_by_id(user.id)
        assert retrieved_user is not None
        assert retrieved_user.email == user.email
    
    def test_get_by_email(self):
        """Тест получения пользователя по email."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        self.repository.save(user)
        
        retrieved_user = self.repository.get_by_email("test@example.com")
        assert retrieved_user is not None
        assert retrieved_user.email == "test@example.com"
        
        non_existent = self.repository.get_by_email("nonexistent@example.com")
        assert non_existent is None

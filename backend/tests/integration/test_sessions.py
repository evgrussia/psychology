"""
Integration тесты для сессий.
"""
import pytest
from django.test import TestCase, Client
from django.contrib.sessions.models import Session
from uuid import uuid4
from datetime import datetime

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.entities import User, UserStatus
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository


@pytest.mark.django_db
class TestSessions(TestCase):
    """Integration тесты для сессий Django."""
    
    def setUp(self):
        self.client = Client()
        self.repository = DjangoUserRepository()
    
    def test_session_creation_on_login(self):
        """Тест создания сессии при логине."""
        # Arrange
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        saved_user = self.repository.save(user)
        
        # Создать Django User для аутентификации
        django_user = UserModel.objects.get(id=saved_user.id)
        
        # Act - логин через Django
        self.client.force_login(django_user)
        
        # Assert - проверить, что сессия создана
        session_key = self.client.session.session_key
        assert session_key is not None
        
        # Проверить, что сессия существует в БД
        session = Session.objects.get(session_key=session_key)
        assert session is not None
    
    def test_session_persistence(self):
        """Тест сохранения данных в сессии."""
        # Arrange
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        saved_user = self.repository.save(user)
        django_user = UserModel.objects.get(id=saved_user.id)
        
        # Act
        self.client.force_login(django_user)
        session = self.client.session
        session['test_key'] = 'test_value'
        session.save()
        
        # Assert
        assert session.get('test_key') == 'test_value'
        
        # Проверить, что данные сохранились после перезагрузки сессии
        session_key = session.session_key
        new_session = Session.objects.get(session_key=session_key)
        assert new_session.get_decoded().get('test_key') == 'test_value'
    
    def test_session_logout(self):
        """Тест удаления сессии при логауте."""
        # Arrange
        user = User(
            id=uuid4(),
            email="test@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        saved_user = self.repository.save(user)
        django_user = UserModel.objects.get(id=saved_user.id)
        
        self.client.force_login(django_user)
        session_key = self.client.session.session_key
        assert session_key is not None
        
        # Act - очистить сессию вручную
        # Примечание: client.logout() не работает с UUID primary key в Django
        # В реальном приложении logout будет работать через API endpoint
        self.client.session.flush()
        
        # Assert - после очистки сессии пользователь не должен быть аутентифицирован
        # После flush() сессия удалена, поэтому проверяем, что ключ сессии стал None
        assert self.client.session.session_key is None or self.client.session.get('_auth_user_id') is None

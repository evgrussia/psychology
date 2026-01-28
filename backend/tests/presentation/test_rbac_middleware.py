"""
Тесты для RBAC middleware.
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
from django.test import TestCase
from django.contrib.auth.models import AnonymousUser
from uuid import uuid4

from presentation.api.middleware import (
    RBACPermission,
    OwnerPermission,
    AssistantPermission,
    EditorPermission,
)
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository


@pytest.mark.django_db
class TestRBACPermission(TestCase):
    """Тесты для RBACPermission."""
    
    def setUp(self):
        self.permission = RBACPermission()
        self.view = Mock()
    
    def test_no_required_roles_allows_access(self):
        """Тест, что если роли не требуются, доступ разрешен."""
        # Arrange
        request = Mock()
        request.user = Mock()
        request.user.is_authenticated = True
        
        self.permission.required_roles = []
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is True
    
    def test_unauthenticated_user_denied(self):
        """Тест, что неаутентифицированный пользователь не имеет доступа."""
        # Arrange
        request = Mock()
        request.user = AnonymousUser()
        
        self.permission.required_roles = ['owner']
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is False
    
    def test_no_user_denied(self):
        """Тест, что если пользователя нет, доступ запрещен."""
        # Arrange
        request = Mock()
        request.user = None
        
        self.permission.required_roles = ['owner']
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is False
    
    @patch('presentation.api.middleware.rbac.get_sync_user_repository')
    def test_user_with_required_role_allowed(self, mock_get_repo):
        """Тест, что пользователь с требуемой ролью имеет доступ."""
        # Arrange
        user_id = uuid4()
        request = Mock()
        request.user = Mock()
        request.user.is_authenticated = True
        request.user.id = user_id
        
        mock_repository = Mock()
        mock_repository.get_user_roles.return_value = ['owner', 'editor']
        mock_get_repo.return_value = mock_repository
        
        self.permission.required_roles = ['owner']
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is True
        mock_repository.get_user_roles.assert_called_once_with(user_id)
    
    @patch('presentation.api.middleware.rbac.get_sync_user_repository')
    def test_user_without_required_role_denied(self, mock_get_repo):
        """Тест, что пользователь без требуемой роли не имеет доступа."""
        # Arrange
        user_id = uuid4()
        request = Mock()
        request.user = Mock()
        request.user.is_authenticated = True
        request.user.id = user_id
        
        mock_repository = Mock()
        mock_repository.get_user_roles.return_value = ['client']
        mock_get_repo.return_value = mock_repository
        
        self.permission.required_roles = ['owner']
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is False
        mock_repository.get_user_roles.assert_called_once_with(user_id)
    
    @patch('presentation.api.middleware.rbac.get_sync_user_repository')
    def test_user_with_pk_instead_of_id(self, mock_get_repo):
        """Тест, что работает с pk вместо id."""
        # Arrange
        user_id = uuid4()
        request = Mock()
        request.user = Mock()
        request.user.is_authenticated = True
        request.user.pk = user_id
        delattr(request.user, 'id')
        
        mock_repository = Mock()
        mock_repository.get_user_roles.return_value = ['owner']
        mock_get_repo.return_value = mock_repository
        
        self.permission.required_roles = ['owner']
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is True
        mock_repository.get_user_roles.assert_called_once_with(user_id)
    
    @patch('presentation.api.middleware.rbac.get_sync_user_repository')
    def test_user_without_id_or_pk_denied(self, mock_get_repo):
        """Тест, что пользователь без id или pk не имеет доступа."""
        # Arrange
        request = Mock()
        request.user = Mock()
        request.user.is_authenticated = True
        # Нет ни id, ни pk
        
        mock_repository = Mock()
        mock_get_repo.return_value = mock_repository
        
        self.permission.required_roles = ['owner']
        
        # Act
        result = self.permission.has_permission(request, self.view)
        
        # Assert
        assert result is False


class TestOwnerPermission(TestCase):
    """Тесты для OwnerPermission."""
    
    def test_required_roles(self):
        """Тест, что OwnerPermission требует роль owner."""
        permission = OwnerPermission()
        assert permission.required_roles == ['owner']


class TestAssistantPermission(TestCase):
    """Тесты для AssistantPermission."""
    
    def test_required_roles(self):
        """Тест, что AssistantPermission требует роли owner или assistant."""
        permission = AssistantPermission()
        assert 'owner' in permission.required_roles
        assert 'assistant' in permission.required_roles


class TestEditorPermission(TestCase):
    """Тесты для EditorPermission."""
    
    def test_required_roles(self):
        """Тест, что EditorPermission требует роли owner или editor."""
        permission = EditorPermission()
        assert 'owner' in permission.required_roles
        assert 'editor' in permission.required_roles
